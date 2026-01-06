from __future__ import annotations

import logging
import os
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
from pathlib import Path

from app.api.deps.auth import get_current_staff
from app.core.database import get_db
from app.core.config import settings
from app.models.enums import StaffRole
from app.models.school import School
from app.models.staff_user import StaffUser
from app.schemas.settings import (
    DashboardOwnerInfo,
    DashboardOwnerUpdate,
    DashboardSchoolInfo,
    DashboardSchoolUpdate,
    DashboardSettingsResponse,
)

router = APIRouter(prefix="/settings", tags=["dashboard-settings"])
logger = logging.getLogger(__name__)


async def _get_school(session: AsyncSession, staff: StaffUser) -> School:
    school = await session.get(School, staff.school_id)
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")
    return school


async def _get_owner(session: AsyncSession, staff: StaffUser) -> StaffUser:
    stmt = (
        select(StaffUser)
        .where(StaffUser.school_id == staff.school_id, StaffUser.role == StaffRole.OWNER)
        .order_by(StaffUser.id.asc())
    )
    result = await session.execute(stmt)
    owner = result.scalars().first()
    if owner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Owner not found")
    return owner


def _build_school_info(school: School) -> DashboardSchoolInfo:
    return DashboardSchoolInfo(
        name=school.name,
        email=school.email,
        address=school.address,
        phone=school.phone,
    )


def _build_owner_info(owner: StaffUser) -> DashboardOwnerInfo:
    return DashboardOwnerInfo(
        first_name=owner.first_name or "",
        last_name=owner.last_name or "",
        email=owner.email,
        phone=owner.phone,
        avatar_url=owner.avatar_url,
    )


@router.get("/", response_model=DashboardSettingsResponse)
async def get_dashboard_settings(
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> DashboardSettingsResponse:
    school = await _get_school(session, current_staff)
    owner = await _get_owner(session, current_staff)
    return DashboardSettingsResponse(
        school=_build_school_info(school),
        owner=_build_owner_info(owner),
    )


@router.put("/school", response_model=DashboardSchoolInfo)
async def update_school_settings(
    payload: DashboardSchoolUpdate,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> DashboardSchoolInfo:
    school = await _get_school(session, current_staff)
    school.name = payload.name
    school.email = payload.email
    school.address = payload.address
    school.phone = payload.phone
    await session.commit()
    await session.refresh(school)
    return _build_school_info(school)


@router.put("/owner", response_model=DashboardOwnerInfo)
async def update_owner_settings(
    payload: DashboardOwnerUpdate,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> DashboardOwnerInfo:
    owner = await _get_owner(session, current_staff)
    owner.email = payload.email
    owner.phone = payload.phone
    owner.first_name = payload.first_name
    owner.last_name = payload.last_name
    owner.avatar_url = payload.avatar_url
    owner.name = f"{payload.first_name} {payload.last_name}".strip() or owner.name
    await session.commit()
    await session.refresh(owner)
    return _build_owner_info(owner)


@router.post("/owner/avatar")
async def upload_avatar(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    # Only allow basic image types
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Invalid image type")

    # Ensure avatars subdir exists under the mounted uploads dir
    avatars_dir = os.path.join(settings.uploads_dir_path, "avatars")
    os.makedirs(avatars_dir, exist_ok=True)

    # Save file
    ext = os.path.splitext(file.filename or "")[1] or ".jpg"
    filename = f"{uuid4().hex}{ext}"
    dest_path = os.path.join(avatars_dir, filename)
    try:
        with open(dest_path, "wb") as out:
            content = await file.read()
            out.write(content)
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {exc}") from exc

    # Build public URL using backend_url or request base
    base = (settings.backend_url or str(request.base_url)).rstrip("/")
    return {"url": f"{base}/uploads/avatars/{filename}"}

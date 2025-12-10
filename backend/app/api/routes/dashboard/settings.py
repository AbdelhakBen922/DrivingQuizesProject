from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import get_current_staff
from app.core.database import get_db
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


def _split_owner_name(full_name: str | None) -> tuple[str, str]:
    if not full_name:
        return "", ""
    parts = full_name.strip().split(" ", 1)
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else ""
    return first_name, last_name


def _compose_owner_name(first_name: str, last_name: str) -> str:
    parts = [part.strip() for part in (first_name, last_name) if part and part.strip()]
    if not parts:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner name is required")
    return " ".join(parts)


def _build_school_info(school: School) -> DashboardSchoolInfo:
    settings = dict(school.settings or {})
    return DashboardSchoolInfo(
        name=school.name,
        email=school.email,
        address=settings.get("address"),
        phone=settings.get("phone"),
    )


def _build_owner_info(owner: StaffUser) -> DashboardOwnerInfo:
    first_name, last_name = _split_owner_name(owner.name)
    return DashboardOwnerInfo(
        first_name=first_name,
        last_name=last_name,
        email=owner.email,
        phone=owner.phone,
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
    updated_settings = dict(school.settings or {})
    updated_settings["address"] = payload.address
    updated_settings["phone"] = payload.phone
    school.settings = updated_settings
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
    owner.name = _compose_owner_name(payload.first_name, payload.last_name)
    await session.commit()
    await session.refresh(owner)
    return _build_owner_info(owner)

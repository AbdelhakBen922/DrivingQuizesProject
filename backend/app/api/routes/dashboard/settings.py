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

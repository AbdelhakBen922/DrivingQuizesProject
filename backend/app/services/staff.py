from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.enums import StaffRole
from app.models.staff_user import StaffUser
from app.repositories import staff as staff_repo
from app.schemas.staff_user import StaffUserCreateRequest

ALLOWED_CREATION_ROLES = {StaffRole.OWNER, StaffRole.ADMIN}


async def create_staff_user(
    session: AsyncSession,
    payload: StaffUserCreateRequest,
    *,
    current_staff: StaffUser,
) -> StaffUser:
    if current_staff.role not in ALLOWED_CREATION_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    existing = await staff_repo.get_staff_by_email(session, payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

    staff = StaffUser(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        first_name=payload.first_name,
        last_name=payload.last_name,
        name=f"{payload.first_name} {payload.last_name}".strip(),
        avatar_url=payload.avatar_url,
        phone=payload.phone,
        is_active=payload.is_active,
        school_id=current_staff.school_id,
    )
    session.add(staff)
    await session.commit()
    await session.refresh(staff)
    return staff

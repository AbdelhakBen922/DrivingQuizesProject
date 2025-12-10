from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff_user import StaffUser


async def get_staff_by_email(session: AsyncSession, email: str) -> StaffUser | None:
    stmt = select(StaffUser).where(StaffUser.email == email)
    result = await session.execute(stmt)
    return result.scalars().first()


async def get_staff_by_id(session: AsyncSession, staff_id: int) -> StaffUser | None:
    return await session.get(StaffUser, staff_id)

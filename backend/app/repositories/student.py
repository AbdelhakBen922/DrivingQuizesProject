from __future__ import annotations

from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import Student


async def get_student_by_code(session: AsyncSession, student_code: str) -> Student | None:
    stmt = select(Student).where(Student.student_code == student_code)
    result = await session.execute(stmt)
    return result.scalars().first()


async def get_student_by_id(session: AsyncSession, student_id: int) -> Student | None:
    return await session.get(Student, student_id)


async def get_student_by_code_and_school(
    session: AsyncSession, student_code: str, school_id: int
) -> Student | None:
    stmt = select(Student).where(Student.student_code == student_code, Student.school_id == school_id)
    result = await session.execute(stmt)
    return result.scalars().first()


async def list_students_by_school(
    session: AsyncSession,
    school_id: int,
    *,
    limit: int | None = None,
    offset: int | None = None,
    search: str | None = None,
) -> list[Student]:
    stmt = select(Student).where(Student.school_id == school_id).order_by(Student.created_at.desc())
    if search:
        like_pattern = f"%{search}%"
        stmt = stmt.where(or_(Student.full_name.ilike(like_pattern), Student.student_code.ilike(like_pattern)))
    if limit is not None:
        stmt = stmt.limit(limit)
    if offset is not None:
        stmt = stmt.offset(offset)
    result = await session.execute(stmt)
    return result.scalars().all()

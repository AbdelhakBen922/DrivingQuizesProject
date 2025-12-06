from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.repositories import student as student_repo
from app.schemas.student import StudentCreateRequest


async def create_student(
    session: AsyncSession,
    payload: StudentCreateRequest,
    *,
    current_staff: StaffUser,
) -> Student:
    existing = await student_repo.get_student_by_code_and_school(
        session,
        payload.student_code,
        current_staff.school_id,
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student code already exists")

    student = Student(
        full_name=payload.full_name,
        student_code=payload.student_code,
        password_hash=get_password_hash(payload.password),
        school_id=current_staff.school_id,
        created_by_id=current_staff.id,
        dob=payload.dob,
        national_id=payload.national_id,
        phone=payload.phone,
        email=payload.email,
        profile_data=payload.profile_data or {},
    )
    session.add(student)
    await session.commit()
    await session.refresh(student)
    return student


async def list_students(session: AsyncSession, *, current_staff: StaffUser) -> list[Student]:
    return await student_repo.list_students_by_school(session, current_staff.school_id)

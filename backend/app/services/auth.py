from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, verify_password
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.repositories import staff as staff_repo
from app.repositories import student as student_repo


async def authenticate_staff(session: AsyncSession, email: str, password: str) -> StaffUser:
    staff = await staff_repo.get_staff_by_email(session, email)
    if not staff or not verify_password(password, staff.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not staff.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff account disabled")
    return staff


async def authenticate_student(session: AsyncSession, student_code: str, password: str) -> Student:
    student = await student_repo.get_student_by_code(session, student_code)
    if not student or not verify_password(password, student.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return student


async def create_staff_token(staff: StaffUser) -> str:
    return create_access_token(
        subject=str(staff.id),
        scope="staff",
        school_id=staff.school_id,
        role=staff.role.value,
    )


async def create_student_token(student: Student) -> str:
    return create_access_token(
        subject=str(student.id),
        scope="student",
        school_id=student.school_id,
    )

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.repositories import student as student_repo
from app.schemas.student import StudentCreateRequest, StudentUpdateRequest


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


async def list_students(
    session: AsyncSession,
    *,
    current_staff: StaffUser,
    limit: int | None = None,
    offset: int | None = None,
    search: str | None = None,
) -> list[Student]:
    return await student_repo.list_students_by_school(
        session,
        current_staff.school_id,
        limit=limit,
        offset=offset,
        search=search,
    )


async def _get_student_or_404(
    session: AsyncSession,
    student_id: int,
    *,
    current_staff: StaffUser,
) -> Student:
    student = await student_repo.get_student_by_id(session, student_id)
    if not student or student.school_id != current_staff.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


async def get_student(session: AsyncSession, student_id: int, *, current_staff: StaffUser) -> Student:
    return await _get_student_or_404(session, student_id, current_staff=current_staff)


async def update_student(
    session: AsyncSession,
    student_id: int,
    payload: StudentUpdateRequest,
    *,
    current_staff: StaffUser,
) -> Student:
    student = await _get_student_or_404(session, student_id, current_staff=current_staff)

    if payload.student_code and payload.student_code != student.student_code:
        existing = await student_repo.get_student_by_code_and_school(
            session,
            payload.student_code,
            current_staff.school_id,
        )
        if existing and existing.id != student.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student code already exists")
        student.student_code = payload.student_code

    if payload.full_name is not None:
        student.full_name = payload.full_name
    if payload.dob is not None:
        student.dob = payload.dob
    if payload.national_id is not None:
        student.national_id = payload.national_id
    if payload.phone is not None:
        student.phone = payload.phone
    if payload.email is not None:
        student.email = payload.email
    if payload.profile_data is not None:
        student.profile_data = payload.profile_data
    if payload.password:
        student.password_hash = get_password_hash(payload.password)

    await session.commit()
    await session.refresh(student)
    return student


async def delete_student(
    session: AsyncSession,
    student_id: int,
    *,
    current_staff: StaffUser,
) -> None:
    student = await _get_student_or_404(session, student_id, current_staff=current_staff)
    await session.delete(student)
    await session.commit()

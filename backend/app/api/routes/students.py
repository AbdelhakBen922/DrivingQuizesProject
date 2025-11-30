from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.school import School
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentRead

router = APIRouter(prefix="/students", tags=["students"])


@router.post("/", response_model=StudentRead, status_code=status.HTTP_201_CREATED)
async def create_student(payload: StudentCreate, session: AsyncSession = Depends(get_db)) -> Student:
    school = await session.get(School, payload.school_id)
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")

    data = payload.model_dump(exclude_unset=True)
    student = Student(**data)
    session.add(student)
    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student code must be unique per school") from exc
    await session.refresh(student)
    return student


@router.get("/", response_model=list[StudentRead])
async def list_students(
    session: AsyncSession = Depends(get_db),
    school_id: uuid.UUID | None = Query(default=None),
) -> list[Student]:
    stmt = select(Student)
    if school_id:
        stmt = stmt.where(Student.school_id == school_id)
    stmt = stmt.order_by(Student.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/{student_id}", response_model=StudentRead)
async def get_student(student_id: uuid.UUID, session: AsyncSession = Depends(get_db)) -> Student:
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student

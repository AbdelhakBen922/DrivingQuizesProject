from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.school import School
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentRead, StudentUpdate

router = APIRouter(prefix="/students", tags=["students"])


async def _get_school(session: AsyncSession, school_id: int) -> School:
	school = await session.get(School, school_id)
	if not school:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")
	return school


async def _get_staff_user(session: AsyncSession, staff_id: int) -> StaffUser:
	staff = await session.get(StaffUser, staff_id)
	if not staff:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff user not found")
	return staff


async def _get_student(session: AsyncSession, student_id: int) -> Student:
	student = await session.get(Student, student_id)
	if not student:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
	return student


@router.post("/", response_model=StudentRead, status_code=status.HTTP_201_CREATED)
async def create_student(payload: StudentCreate, session: AsyncSession = Depends(get_db)) -> Student:
	data = payload.model_dump(exclude_unset=True)
	school_id = data["school_id"]
	await _get_school(session, school_id)

	created_by_id = data.get("created_by_id")
	if created_by_id is not None:
		staff = await _get_staff_user(session, created_by_id)
		if staff.school_id != school_id:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail="Staff user must belong to the same school",
			)

	student = Student(**data)
	session.add(student)
	await session.commit()
	await session.refresh(student)
	return student


@router.get("/", response_model=list[StudentRead])
async def list_students(
	session: AsyncSession = Depends(get_db),
	school_id: int | None = Query(default=None, description="Filter by school"),
) -> list[Student]:
	stmt = select(Student).order_by(Student.created_at.desc())
	if school_id is not None:
		stmt = stmt.where(Student.school_id == school_id)
	result = await session.execute(stmt)
	return result.scalars().all()


@router.get("/{student_id}", response_model=StudentRead)
async def get_student(student_id: int, session: AsyncSession = Depends(get_db)) -> Student:
	return await _get_student(session, student_id)


@router.patch("/{student_id}", response_model=StudentRead)
async def update_student(
	student_id: int, payload: StudentUpdate, session: AsyncSession = Depends(get_db)
) -> Student:
	student = await _get_student(session, student_id)
	data = payload.model_dump(exclude_unset=True)

	if "school_id" in data:
		new_school_id = data["school_id"]
		if new_school_id is None:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="school_id cannot be null")
		await _get_school(session, new_school_id)
		target_school_id = new_school_id
	else:
		target_school_id = student.school_id

	creator_provided = "created_by_id" in data
	final_creator_id = data.get("created_by_id", student.created_by_id)
	if final_creator_id is not None and (creator_provided or "school_id" in data):
		staff = await _get_staff_user(session, final_creator_id)
		if staff.school_id != target_school_id:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail="Staff user must belong to the same school",
			)

	for field, value in data.items():
		setattr(student, field, value)

	await session.commit()
	await session.refresh(student)
	return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(student_id: int, session: AsyncSession = Depends(get_db)) -> Response:
	student = await _get_student(session, student_id)
	await session.delete(student)
	await session.commit()
	return Response(status_code=status.HTTP_204_NO_CONTENT)

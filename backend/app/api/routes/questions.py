from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.question import Question
from app.models.school import School
from app.models.staff_user import StaffUser
from app.schemas.question import QuestionCreate, QuestionRead, QuestionUpdate

router = APIRouter(prefix="/questions", tags=["questions"])


async def _ensure_school(session: AsyncSession, school_id: int | None) -> None:
	if school_id is None:
		return
	school = await session.get(School, school_id)
	if not school:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")


async def _ensure_staff(session: AsyncSession, staff_id: int | None) -> None:
	if staff_id is None:
		return
	staff = await session.get(StaffUser, staff_id)
	if not staff:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff user not found")


@router.post("/", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
async def create_question(payload: QuestionCreate, session: AsyncSession = Depends(get_db)) -> Question:
	data = payload.model_dump(exclude_unset=True)
	await _ensure_school(session, data.get("school_id"))
	await _ensure_staff(session, data.get("author_id"))

	question = Question(**data)
	session.add(question)
	await session.commit()
	await session.refresh(question)
	return question


@router.get("/", response_model=list[QuestionRead])
async def list_questions(
	session: AsyncSession = Depends(get_db),
	school_id: int | None = Query(default=None),
	author_id: int | None = Query(default=None),
	category: str | None = Query(default=None),
	difficulty: str | None = Query(default=None),
) -> list[Question]:
	stmt = select(Question).order_by(Question.created_at.desc())
	if school_id is not None:
		stmt = stmt.where(Question.school_id == school_id)
	if author_id is not None:
		stmt = stmt.where(Question.author_id == author_id)
	if category is not None:
		stmt = stmt.where(Question.category == category)
	if difficulty is not None:
		stmt = stmt.where(Question.difficulty == difficulty)

	result = await session.execute(stmt)
	return result.scalars().all()


@router.get("/{question_id}", response_model=QuestionRead)
async def get_question(question_id: int, session: AsyncSession = Depends(get_db)) -> Question:
	question = await session.get(Question, question_id)
	if not question:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
	return question


@router.patch("/{question_id}", response_model=QuestionRead)
async def update_question(
	question_id: int, payload: QuestionUpdate, session: AsyncSession = Depends(get_db)
) -> Question:
	question = await session.get(Question, question_id)
	if not question:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

	data = payload.model_dump(exclude_unset=True)
	if "school_id" in data:
		school_id = data["school_id"]
		if school_id is not None:
			await _ensure_school(session, school_id)
		else:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="school_id cannot be null")
	if "author_id" in data and data["author_id"] is not None:
		await _ensure_staff(session, data["author_id"])

	for field, value in data.items():
		setattr(question, field, value)

	await session.commit()
	await session.refresh(question)
	return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(question_id: int, session: AsyncSession = Depends(get_db)) -> Response:
	question = await session.get(Question, question_id)
	if not question:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

	await session.delete(question)
	await session.commit()
	return Response(status_code=status.HTTP_204_NO_CONTENT)

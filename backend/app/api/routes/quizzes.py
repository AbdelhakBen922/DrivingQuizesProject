from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.quiz import Quiz
from app.models.quiz_setting import QuizSetting
from app.models.school import School
from app.models.staff_user import StaffUser
from app.schemas.quiz import QuizCreate, QuizRead
from app.schemas.quiz_setting import QuizSettingCreate, QuizSettingRead

router = APIRouter()


async def _ensure_school(session: AsyncSession, school_id: int | None) -> None:
    if school_id is None:
        return
    school = await session.get(School, school_id)
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")


async def _ensure_staff_user(session: AsyncSession, staff_id: int | None) -> None:
    if staff_id is None:
        return
    staff = await session.get(StaffUser, staff_id)
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff user not found")


async def _ensure_quiz_setting(session: AsyncSession, setting_id: int) -> QuizSetting:
    setting = await session.get(QuizSetting, setting_id)
    if not setting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz setting not found")
    return setting


@router.post("/quiz-settings", response_model=QuizSettingRead, status_code=status.HTTP_201_CREATED)
async def create_quiz_setting(
    payload: QuizSettingCreate, session: AsyncSession = Depends(get_db)
) -> QuizSetting:
    setting = QuizSetting(**payload.model_dump(exclude_unset=True))
    session.add(setting)
    await session.commit()
    await session.refresh(setting)
    return setting


@router.get("/quiz-settings", response_model=list[QuizSettingRead])
async def list_quiz_settings(session: AsyncSession = Depends(get_db)) -> list[QuizSetting]:
    result = await session.execute(select(QuizSetting).order_by(QuizSetting.created_at.desc()))
    return result.scalars().all()


@router.get("/quiz-settings/{setting_id}", response_model=QuizSettingRead)
async def get_quiz_setting(setting_id: int, session: AsyncSession = Depends(get_db)) -> QuizSetting:
    setting = await session.get(QuizSetting, setting_id)
    if not setting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz setting not found")
    return setting


@router.post("/quizzes", response_model=QuizRead, status_code=status.HTTP_201_CREATED)
async def create_quiz(payload: QuizCreate, session: AsyncSession = Depends(get_db)) -> Quiz:
    data = payload.model_dump(exclude_unset=True)

    await _ensure_school(session, data.get("school_id"))
    await _ensure_staff_user(session, data.get("created_by_id"))

    setting_id = data.get("setting_id")
    if setting_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="setting_id is required")
    await _ensure_quiz_setting(session, setting_id)

    quiz = Quiz(**data)
    session.add(quiz)
    await session.commit()

    result = await session.execute(
        select(Quiz).options(selectinload(Quiz.setting)).where(Quiz.id == quiz.id)
    )
    return result.scalar_one()


@router.get("/quizzes", response_model=list[QuizRead])
async def list_quizzes(
    session: AsyncSession = Depends(get_db),
    school_id: int | None = Query(default=None),
) -> list[Quiz]:
    stmt = select(Quiz).options(selectinload(Quiz.setting)).order_by(Quiz.created_at.desc())
    if school_id is not None:
        stmt = stmt.where(Quiz.school_id == school_id)
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/quizzes/{quiz_id}", response_model=QuizRead)
async def get_quiz(quiz_id: int, session: AsyncSession = Depends(get_db)) -> Quiz:
    result = await session.execute(
        select(Quiz).options(selectinload(Quiz.setting)).where(Quiz.id == quiz_id)
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    return quiz

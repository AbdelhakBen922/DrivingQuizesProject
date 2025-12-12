from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps.auth import get_current_staff
from app.core.database import get_db
from app.models.quiz import Quiz
from app.models.quiz_setting import QuizSetting
from app.models.quiz_template import QuizTemplate
from app.models.room import Room
from app.models.staff_user import StaffUser
from app.schemas.dashboard_quiz import DashboardQuizCreateRequest
from app.schemas.quiz import QuizRead

router = APIRouter(prefix="/quizzes", tags=["dashboard-quizzes"])


async def _require_staff_school(staff: StaffUser) -> int:
    if staff.school_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Staff must belong to a school")
    return staff.school_id


async def _get_room_for_school(session: AsyncSession, room_id: int, school_id: int) -> Room:
    room = await session.get(Room, room_id)
    if not room or room.school_id != school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return room


async def _get_template_for_school(
    session: AsyncSession, template_id: int, school_id: int
) -> QuizTemplate:
    template = await session.get(QuizTemplate, template_id)
    if not template or template.school_id != school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return template


def _quiz_with_relations_stmt(quiz_id: int | None = None):
    stmt = select(Quiz).options(
        selectinload(Quiz.setting),
        selectinload(Quiz.template),
    )
    if quiz_id is not None:
        stmt = stmt.where(Quiz.id == quiz_id)
    return stmt


@router.get("/", response_model=list[QuizRead])
async def list_dashboard_quizzes(
    room_id: int | None = Query(default=None),
    template_id: int | None = Query(default=None),
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> list[Quiz]:
    school_id = await _require_staff_school(current_staff)

    stmt = _quiz_with_relations_stmt().where(Quiz.school_id == school_id).order_by(Quiz.created_at.desc())
    if room_id is not None:
        stmt = stmt.where(Quiz.room_id == room_id)
    if template_id is not None:
        stmt = stmt.where(Quiz.template_id == template_id)

    result = await session.execute(stmt)
    return result.scalars().all()


@router.post("/", response_model=QuizRead, status_code=status.HTTP_201_CREATED)
async def create_dashboard_quiz(
    payload: DashboardQuizCreateRequest,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> Quiz:
    school_id = await _require_staff_school(current_staff)
    room = await _get_room_for_school(session, payload.room_id, school_id)
    template = await _get_template_for_school(session, payload.template_id, school_id)

    setting_data = payload.settings.model_dump(exclude_unset=True)
    setting = QuizSetting(**setting_data)
    session.add(setting)
    await session.flush()

    quiz = Quiz(
        school_id=school_id,
        setting_id=setting.id,
        template_id=template.id,
        room_id=room.id,
        is_public=payload.is_public,
        title_ar=payload.title_ar,
        title_fr=payload.title_fr,
        description=payload.description,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        created_by_id=current_staff.id,
    )
    session.add(quiz)
    await session.commit()

    result = await session.execute(_quiz_with_relations_stmt(quiz.id))
    return result.scalar_one()

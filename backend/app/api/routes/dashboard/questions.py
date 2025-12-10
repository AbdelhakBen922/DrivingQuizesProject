from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import Select, delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps.auth import get_current_staff
from app.core.database import get_db
from app.models.choice import Choice
from app.models.question import Question
from app.models.quiz_template_question import QuizTemplateQuestion
from app.models.staff_user import StaffUser
from app.models.enums import QuestionCategory, QuestionDifficulty, QuestionType
from app.schemas.question import (
    QuestionChoiceInput,
    QuestionWithChoicesCreate,
    QuestionWithChoicesRead,
    QuestionWithChoicesUpdate,
)

router = APIRouter(prefix="/questions", tags=["dashboard-questions"])


def _question_with_choices_stmt() -> Select:
    return select(Question).options(selectinload(Question.choices)).where(Question.deleted_at.is_(None))


def _school_scope_clause(school_id: int, include_public: bool):
    if include_public:
        return or_(Question.school_id == school_id, Question.school_id.is_(None))
    return Question.school_id == school_id


def _normalize_choice_inputs(choices: list[QuestionChoiceInput]) -> list[dict[str, int | str | bool]]:
    if not choices or len(choices) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least two choices are required")

    normalized: list[dict[str, int | str | bool]] = []
    seen_positions: set[int] = set()
    has_correct = False

    for index, choice in enumerate(choices):
        position = choice.position if choice.position is not None else index
        if position in seen_positions:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Duplicate choice positions detected")
        seen_positions.add(position)
        has_correct = has_correct or choice.is_correct
        normalized.append({"text": choice.text, "is_correct": choice.is_correct, "position": position})

    if not has_correct:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mark at least one choice as correct")

    return normalized


def _require_staff_school(staff: StaffUser) -> int:
    if staff.school_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Staff must belong to a school")
    return staff.school_id


async def _get_question_for_school(
    session: AsyncSession,
    question_id: int,
    school_id: int,
    *,
    include_public: bool,
) -> Question:
    stmt = (
        _question_with_choices_stmt()
        .where(Question.id == question_id)
        .where(_school_scope_clause(school_id, include_public))
    )
    result = await session.execute(stmt)
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return question


@router.get("/", response_model=list[QuestionWithChoicesRead])
async def list_dashboard_questions(
    search: str | None = Query(default=None, min_length=2),
    category: QuestionCategory | None = Query(default=None),
    difficulty: QuestionDifficulty | None = Query(default=None),
    question_type: QuestionType | None = Query(default=None),
    include_public: bool = Query(default=True),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> list[QuestionWithChoicesRead]:
    school_id = _require_staff_school(current_staff)

    stmt = (
        _question_with_choices_stmt()
        .where(_school_scope_clause(school_id, include_public))
        .order_by(Question.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    if search:
        stmt = stmt.where(Question.text.ilike(f"%{search}%"))
    if category is not None:
        stmt = stmt.where(Question.category == category)
    if difficulty is not None:
        stmt = stmt.where(Question.difficulty == difficulty)
    if question_type is not None:
        stmt = stmt.where(Question.type == question_type)

    result = await session.execute(stmt)
    questions = result.scalars().all()
    return [QuestionWithChoicesRead.model_validate(question) for question in questions]


@router.post("/", response_model=QuestionWithChoicesRead, status_code=status.HTTP_201_CREATED)
async def create_dashboard_question(
    payload: QuestionWithChoicesCreate,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> QuestionWithChoicesRead:
    school_id = _require_staff_school(current_staff)
    normalized_choices = _normalize_choice_inputs(payload.choices)

    question_data = payload.model_dump(exclude={"choices"})
    question = Question(
        school_id=school_id,
        author_id=current_staff.id,
        **question_data,
    )
    session.add(question)
    await session.flush()

    for choice_data in normalized_choices:
        session.add(Choice(question_id=question.id, **choice_data))

    await session.commit()
    question = await _get_question_for_school(session, question.id, school_id, include_public=False)
    return QuestionWithChoicesRead.model_validate(question)


@router.get("/{question_id}", response_model=QuestionWithChoicesRead)
async def get_dashboard_question(
    question_id: int,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> QuestionWithChoicesRead:
    school_id = _require_staff_school(current_staff)
    question = await _get_question_for_school(session, question_id, school_id, include_public=True)
    return QuestionWithChoicesRead.model_validate(question)


@router.patch("/{question_id}", response_model=QuestionWithChoicesRead)
async def update_dashboard_question(
    question_id: int,
    payload: QuestionWithChoicesUpdate,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> QuestionWithChoicesRead:
    school_id = _require_staff_school(current_staff)
    question = await _get_question_for_school(session, question_id, school_id, include_public=False)

    update_data = payload.model_dump(exclude_unset=True, exclude={"choices"})
    for field, value in update_data.items():
        setattr(question, field, value)
    question.author_id = current_staff.id

    if payload.choices is not None:
        normalized_choices = _normalize_choice_inputs(payload.choices)
        await session.execute(delete(Choice).where(Choice.question_id == question.id))
        for choice_data in normalized_choices:
            session.add(Choice(question_id=question.id, **choice_data))

    await session.commit()
    updated = await _get_question_for_school(session, question.id, school_id, include_public=False)
    return QuestionWithChoicesRead.model_validate(updated)


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dashboard_question(
    question_id: int,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> Response:
    school_id = _require_staff_school(current_staff)
    question = await _get_question_for_school(session, question_id, school_id, include_public=False)

    usage_stmt = select(func.count()).where(QuizTemplateQuestion.question_id == question.id)
    usage_count = await session.scalar(usage_stmt)
    if usage_count and usage_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is linked to one or more templates",
        )

    await session.delete(question)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

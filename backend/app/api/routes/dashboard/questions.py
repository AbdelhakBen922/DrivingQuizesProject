from __future__ import annotations

import os
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, Response, UploadFile, status
from sqlalchemy import Select, delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps.auth import get_current_staff
from app.core.config import settings
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

DEFAULT_SCHOOL_ID = 0


def _question_with_choices_stmt() -> Select:
    return select(Question).options(selectinload(Question.choices)).where(Question.deleted_at.is_(None))


def _school_scope_clause(school_id: int, include_default: bool):
    if include_default:
        return or_(
            Question.school_id == school_id,
            Question.school_id == DEFAULT_SCHOOL_ID,
            Question.school_id.is_(None),
        )
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
        normalized.append(
            {
                "text_ar": choice.text_ar,
                "text_fr": choice.text_fr,
                "is_correct": choice.is_correct,
                "position": position,
            }
        )

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
    include_default: bool,
) -> Question:
    stmt = (
        _question_with_choices_stmt()
        .where(Question.id == question_id)
        .where(_school_scope_clause(school_id, include_default))
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
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> list[QuestionWithChoicesRead]:
    school_id = _require_staff_school(current_staff)

    stmt = (
        _question_with_choices_stmt()
        .where(_school_scope_clause(school_id, include_default=True))
        .order_by(Question.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    if search:
        stmt = stmt.where(
            or_(
                Question.text_ar.ilike(f"%{search}%"),
                Question.text_fr.ilike(f"%{search}%"),
            )
        )
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
    question = await _get_question_for_school(session, question_id, school_id, include_default=True)
    return QuestionWithChoicesRead.model_validate(question)


@router.patch("/{question_id}", response_model=QuestionWithChoicesRead)
async def update_dashboard_question(
    question_id: int,
    payload: QuestionWithChoicesUpdate,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> QuestionWithChoicesRead:
    school_id = _require_staff_school(current_staff)
    question = await _get_question_for_school(session, question_id, school_id, include_default=False)

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
    question = await _get_question_for_school(session, question_id, school_id, include_default=False)

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


@router.post("/upload-image")
async def upload_question_image(
    request: Request,
    image: UploadFile = File(...),
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
):
    """Upload an image for a question"""
    if image.content_type not in {"image/jpeg", "image/png", "image/webp", "image/jpg"}:
        raise HTTPException(status_code=400, detail="Invalid image type. Only JPEG, PNG, and WebP are allowed.")

    # Create questions images directory
    questions_dir = os.path.join(settings.uploads_dir_path, "questions")
    os.makedirs(questions_dir, exist_ok=True)

    # Generate unique filename
    ext = os.path.splitext(image.filename or "")[1] or ".jpg"
    filename = f"{uuid4().hex}{ext}"
    dest_path = os.path.join(questions_dir, filename)
    
    try:
        with open(dest_path, "wb") as out:
            content = await image.read()
            out.write(content)
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {exc}") from exc

    # Return the URL
    base = (settings.backend_url or str(request.base_url)).rstrip("/")
    return {"image_url": f"{base}/uploads/questions/{filename}"}

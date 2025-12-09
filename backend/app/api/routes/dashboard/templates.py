from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import get_current_staff
from app.core.database import get_db
from app.models.enums import QuestionDifficulty
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.quiz_template import QuizTemplate
from app.models.quiz_template_question import QuizTemplateQuestion
from app.models.staff_user import StaffUser
from app.schemas.quiz_template import (
    QuizTemplateCreateRequest,
    QuizTemplateListItem,
    QuizTemplateUpdateRequest,
)
from app.schemas.quiz_template_question import QuizTemplateQuestionInput

router = APIRouter(prefix="/templates", tags=["dashboard-templates"])


async def _get_editable_template(
    session: AsyncSession, template_id: int, staff: StaffUser
) -> QuizTemplate:
    template = await session.get(QuizTemplate, template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    if template.created_by_id != staff.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot modify this template")
    return template


async def _validate_question_payloads(
    session: AsyncSession,
    question_payloads: list[QuizTemplateQuestionInput],
    staff: StaffUser,
) -> list[int]:
    question_ids = [item.question_id for item in question_payloads]
    if len(question_ids) != len(set(question_ids)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Duplicate question IDs are not allowed")

    stmt = select(Question).where(Question.id.in_(question_ids))
    result = await session.execute(stmt)
    questions = result.scalars().all()
    found_ids = {question.id for question in questions}
    missing_ids = sorted(set(question_ids) - found_ids)
    if missing_ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"missing_question_ids": missing_ids})

    for question in questions:
        if question.school_id not in (None, staff.school_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Question not accessible for this school")

    return question_ids


@router.get("/", response_model=list[QuizTemplateListItem])
async def list_templates(
    topic_id: int | None = Query(default=None),
    difficulty: QuestionDifficulty | None = Query(default=None),
    search: str | None = Query(default=None, min_length=1),
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> list[QuizTemplateListItem]:
    stmt = (
        select(QuizTemplate, func.count(QuizTemplateQuestion.id).label("question_count"))
        .outerjoin(QuizTemplateQuestion, QuizTemplateQuestion.template_id == QuizTemplate.id)
        .group_by(QuizTemplate.id)
        .order_by(QuizTemplate.created_at.desc())
    )

    visibility_clause = or_(QuizTemplate.is_public.is_(True), QuizTemplate.created_by_id == current_staff.id)
    stmt = stmt.where(visibility_clause)

    if topic_id is not None:
        stmt = stmt.where(QuizTemplate.topic_id == topic_id)
    if difficulty is not None:
        stmt = stmt.where(QuizTemplate.difficulty == difficulty)
    if search:
        stmt = stmt.where(QuizTemplate.title.ilike(f"%{search}%"))

    result = await session.execute(stmt)
    rows = result.all()

    templates: list[QuizTemplateListItem] = []
    for template, question_count in rows:
        setattr(template, "question_count", int(question_count or 0))
        templates.append(QuizTemplateListItem.model_validate(template))

    return templates


@router.post("/", response_model=QuizTemplateListItem, status_code=status.HTTP_201_CREATED)
async def create_template(
    payload: QuizTemplateCreateRequest,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> QuizTemplateListItem:
    if not payload.questions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one question is required")

    question_ids = await _validate_question_payloads(session, payload.questions, current_staff)

    template = QuizTemplate(
        title=payload.title,
        description=payload.description,
        topic_id=payload.topic_id,
        difficulty=payload.difficulty,
        default_duration_sec=payload.default_duration_sec,
        settings=payload.settings,
        is_public=payload.is_public,
        created_by_id=current_staff.id,
    )
    session.add(template)
    await session.flush()

    for index, question_payload in enumerate(payload.questions):
        template_question = QuizTemplateQuestion(
            template_id=template.id,
            question_id=question_payload.question_id,
            position=question_payload.position if question_payload.position is not None else index,
            duration_sec=question_payload.duration_sec,
            is_required=question_payload.is_required,
            randomize_options=question_payload.randomize_options,
            estimation_time_seconds=question_payload.estimation_time_seconds,
        )
        session.add(template_question)

    await session.commit()
    await session.refresh(template)
    template.question_count = len(question_ids)
    return QuizTemplateListItem.model_validate(template)


@router.put("/{template_id}", response_model=QuizTemplateListItem)
async def update_template(
    template_id: int,
    payload: QuizTemplateUpdateRequest,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> QuizTemplateListItem:
    template = await _get_editable_template(session, template_id, current_staff)

    if payload.title is not None:
        template.title = payload.title
    if payload.description is not None:
        template.description = payload.description
    if payload.topic_id is not None:
        template.topic_id = payload.topic_id
    if payload.difficulty is not None:
        template.difficulty = payload.difficulty
    if payload.default_duration_sec is not None:
        template.default_duration_sec = payload.default_duration_sec
    if payload.settings is not None:
        template.settings = payload.settings
    if payload.is_public is not None:
        template.is_public = payload.is_public

    question_count: int | None = None
    if payload.questions is not None:
        if not payload.questions:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one question is required")
        question_ids = await _validate_question_payloads(session, payload.questions, current_staff)
        await session.execute(
            delete(QuizTemplateQuestion).where(QuizTemplateQuestion.template_id == template.id)
        )
        for index, question_payload in enumerate(payload.questions):
            template_question = QuizTemplateQuestion(
                template_id=template.id,
                question_id=question_payload.question_id,
                position=question_payload.position if question_payload.position is not None else index,
                duration_sec=question_payload.duration_sec,
                is_required=question_payload.is_required,
                randomize_options=question_payload.randomize_options,
                estimation_time_seconds=question_payload.estimation_time_seconds,
            )
            session.add(template_question)
        question_count = len(question_ids)

    await session.commit()
    await session.refresh(template)

    if question_count is None:
        count_stmt = select(func.count(QuizTemplateQuestion.id)).where(
            QuizTemplateQuestion.template_id == template.id
        )
        count_result = await session.execute(count_stmt)
        question_count = int(count_result.scalar_one())

    template.question_count = question_count
    return QuizTemplateListItem.model_validate(template)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: int,
    force: bool = Query(default=False),
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> Response:
    template = await _get_editable_template(session, template_id, current_staff)

    if not force:
        quiz_stmt = select(Quiz.id).where(Quiz.template_id == template.id).limit(1)
        quiz_result = await session.execute(quiz_stmt)
        if quiz_result.scalar() is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Template is linked to existing quizzes. Pass force=true to delete.",
            )

    await session.delete(template)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

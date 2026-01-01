from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps.auth import get_current_staff
from app.core.database import get_db
from app.models.choice import Choice
from app.models.enums import QuestionDifficulty
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.quiz_template import QuizTemplate
from app.models.quiz_template_question import QuizTemplateQuestion
from app.models.staff_user import StaffUser
from app.schemas.question import QuestionRead, QuestionWithChoicesCreate
from app.schemas.quiz_template import (
    QuizTemplateCreateRequest,
    QuizTemplateDetail,
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
    if template.school_id != staff.school_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Template belongs to another school")
    if template.created_by_id != staff.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot modify this template")
    return template


async def _create_question_with_choices(
    session: AsyncSession,
    question_payload: QuestionWithChoicesCreate,
    staff: StaffUser,
) -> Question:
    if staff.school_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Staff user must belong to a school")

    choices = question_payload.choices or []
    if len(choices) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least two choices are required")
    if not any(choice.is_correct for choice in choices):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mark at least one choice as correct")

    seen_positions: set[int] = set()
    processed_choices: list[dict[str, int | str | bool]] = []
    for index, choice in enumerate(choices):
        position = choice.position if choice.position is not None else index
        if position in seen_positions:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Duplicate choice positions detected")
        seen_positions.add(position)
        processed_choices.append({
            "text_ar": choice.text_ar,
            "text_fr": choice.text_fr,
            "is_correct": choice.is_correct,
            "position": position,
        })

    question_data = question_payload.model_dump(exclude={"choices"})
    question = Question(
        school_id=staff.school_id,
        author_id=staff.id,
        **question_data,
    )
    session.add(question)
    await session.flush()

    for choice_data in processed_choices:
        session.add(
                Choice(
                    question_id=question.id,
                    text_ar=choice_data["text_ar"],
                    text_fr=choice_data["text_fr"],
                    is_correct=choice_data["is_correct"],
                    position=choice_data["position"],
                )
        )

    await session.flush()
    return question


async def _resolve_question_from_payload(
    session: AsyncSession,
    payload: QuizTemplateQuestionInput,
    staff: StaffUser,
) -> Question:
    if payload.question_id is not None:
        question = await session.get(Question, payload.question_id)
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
        if question.school_id not in (None, staff.school_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Question not accessible for this school")
        return question

    if payload.question is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question payload is required")
    return await _create_question_with_choices(session, payload.question, staff)


async def _prepare_template_question_entries(
    session: AsyncSession,
    question_payloads: list[QuizTemplateQuestionInput],
    staff: StaffUser,
) -> list[dict[str, int | bool | None]]:
    resolved_entries: list[dict[str, int | bool | None]] = []
    seen_question_ids: set[int] = set()

    for index, payload in enumerate(question_payloads):
        question = await _resolve_question_from_payload(session, payload, staff)
        if question.id in seen_question_ids:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Duplicate question IDs are not allowed")
        seen_question_ids.add(question.id)
        resolved_entries.append(
            {
                "question_id": question.id,
                "position": payload.position if payload.position is not None else index,
                "duration_sec": payload.duration_sec,
                "is_required": payload.is_required,
                "randomize_options": payload.randomize_options,
                "estimation_time_seconds": payload.estimation_time_seconds,
            }
        )

    return resolved_entries


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

    stmt = stmt.where(QuizTemplate.school_id == current_staff.school_id)

    if topic_id is not None:
        stmt = stmt.where(QuizTemplate.topic_id == topic_id)
    if difficulty is not None:
        stmt = stmt.where(QuizTemplate.difficulty == difficulty)
    if search:
        stmt = stmt.where(
            or_(
                QuizTemplate.title.ilike(f"%{search}%"),
                QuizTemplate.title_ar.ilike(f"%{search}%"),
                QuizTemplate.title_fr.ilike(f"%{search}%"),
            )
        )

    result = await session.execute(stmt)
    rows = result.all()

    templates: list[QuizTemplateListItem] = []
    for template, question_count in rows:
        setattr(template, "question_count", int(question_count or 0))
        templates.append(QuizTemplateListItem.model_validate(template))

    return templates


@router.get("/defaults", response_model=list[QuizTemplateListItem])
async def list_default_templates(
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
    stmt = stmt.where(QuizTemplate.is_public.is_(True))

    if difficulty is not None:
        stmt = stmt.where(QuizTemplate.difficulty == difficulty)
    if search:
        stmt = stmt.where(
            or_(
                QuizTemplate.title.ilike(f"%{search}%"),
                QuizTemplate.title_ar.ilike(f"%{search}%"),
                QuizTemplate.title_fr.ilike(f"%{search}%"),
            )
        )

    result = await session.execute(stmt)
    rows = result.all()

    templates: list[QuizTemplateListItem] = []
    for template, question_count in rows:
        setattr(template, "question_count", int(question_count or 0))
        templates.append(QuizTemplateListItem.model_validate(template))

    return templates


@router.get("/{template_id}", response_model=QuizTemplateDetail)
async def get_template(
    template_id: int,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> QuizTemplateDetail:
    """Get a single template with all questions and choices"""
    stmt = (
        select(QuizTemplate)
        .where(QuizTemplate.id == template_id)
        .where(QuizTemplate.school_id == current_staff.school_id)
        .options(
            selectinload(QuizTemplate.template_questions)
            .selectinload(QuizTemplateQuestion.question)
            .selectinload(Question.choices)
        )
    )
    
    result = await session.execute(stmt)
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    
    return QuizTemplateDetail.model_validate(template)


@router.post("/", response_model=QuizTemplateListItem, status_code=status.HTTP_201_CREATED)
async def create_template(
    payload: QuizTemplateCreateRequest,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> QuizTemplateListItem:
    if not payload.questions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one question is required")

    question_entries = await _prepare_template_question_entries(session, payload.questions, current_staff)

    template = QuizTemplate(
        school_id=current_staff.school_id,
        title=payload.title,
        title_ar=payload.title_ar,
        title_fr=payload.title_fr,
        description=payload.description,
        description_ar=payload.description_ar,
        description_fr=payload.description_fr,
        topic_id=payload.topic_id,
        difficulty=payload.difficulty,
        default_duration_sec=payload.default_duration_sec,
        settings=payload.settings,
        is_public=payload.is_public,
        created_by_id=current_staff.id,
    )
    session.add(template)
    await session.flush()

    for entry in question_entries:
        template_question = QuizTemplateQuestion(
            template_id=template.id,
            question_id=entry["question_id"],
            position=entry["position"],
            duration_sec=entry["duration_sec"],
            is_required=entry["is_required"],
            randomize_options=entry["randomize_options"],
            estimation_time_seconds=entry["estimation_time_seconds"],
        )
        session.add(template_question)

    await session.commit()
    await session.refresh(template)
    template.question_count = len(question_entries)
    return QuizTemplateListItem.model_validate(template)


@router.post("/questions", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
async def create_question_for_template(
    payload: QuestionWithChoicesCreate,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> QuestionRead:
    question = await _create_question_with_choices(session, payload, current_staff)
    await session.commit()
    await session.refresh(question)
    return QuestionRead.model_validate(question)


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
    if payload.title_ar is not None:
        template.title_ar = payload.title_ar
    if payload.title_fr is not None:
        template.title_fr = payload.title_fr
    if payload.description is not None:
        template.description = payload.description
    if payload.description_ar is not None:
        template.description_ar = payload.description_ar
    if payload.description_fr is not None:
        template.description_fr = payload.description_fr
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
        question_entries = await _prepare_template_question_entries(session, payload.questions, current_staff)
        await session.execute(
            delete(QuizTemplateQuestion).where(QuizTemplateQuestion.template_id == template.id)
        )
        for entry in question_entries:
            template_question = QuizTemplateQuestion(
                template_id=template.id,
                question_id=entry["question_id"],
                position=entry["position"],
                duration_sec=entry["duration_sec"],
                is_required=entry["is_required"],
                randomize_options=entry["randomize_options"],
                estimation_time_seconds=entry["estimation_time_seconds"],
            )
            session.add(template_question)
        question_count = len(question_entries)

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

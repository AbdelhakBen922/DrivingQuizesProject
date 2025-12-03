from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.question_bank_question import QuestionBankQuestion
from app.models.quiz_template import QuizTemplate
from app.models.quiz_template_question import QuizTemplateQuestion
from app.schemas.question import QuestionCreate, QuestionUpdate
from app.schemas.quiz_template_question import (
    TemplateQuestionCreate,
    TemplateQuestionRead,
    TemplateQuestionReorderPayload,
    TemplateQuestionUpdate,
)

router = APIRouter(prefix="/quiz-templates/{template_id}/questions", tags=["template_questions"])


async def _get_template(session: AsyncSession, template_id: uuid.UUID) -> QuizTemplate:
    template = await session.get(QuizTemplate, template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz template not found")
    return template


async def _load_template_question(
    session: AsyncSession, template_id: uuid.UUID, template_question_id: uuid.UUID
) -> QuizTemplateQuestion:
    stmt = (
        select(QuizTemplateQuestion)
        .options(selectinload(QuizTemplateQuestion.question))
        .where(
            QuizTemplateQuestion.id == template_question_id,
            QuizTemplateQuestion.quiz_template_id == template_id,
        )
    )
    result = await session.execute(stmt)
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template question not found")
    return question


@router.get("/", response_model=list[TemplateQuestionRead])
async def list_template_questions(template_id: uuid.UUID, session: AsyncSession = Depends(get_db)) -> list[QuizTemplateQuestion]:
    await _get_template(session, template_id)
    stmt = (
        select(QuizTemplateQuestion)
        .options(selectinload(QuizTemplateQuestion.question))
        .where(QuizTemplateQuestion.quiz_template_id == template_id)
        .order_by(QuizTemplateQuestion.question_order)
    )
    result = await session.execute(stmt)
    return result.scalars().unique().all()


@router.post("/", response_model=TemplateQuestionRead, status_code=status.HTTP_201_CREATED)
async def add_template_question(
    template_id: uuid.UUID,
    payload: TemplateQuestionCreate,
    session: AsyncSession = Depends(get_db),
) -> QuizTemplateQuestion:
    template = await _get_template(session, template_id)

    question: QuestionBankQuestion
    if payload.question_id:
        question = await session.get(QuestionBankQuestion, payload.question_id)
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    else:
        if not payload.question:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="question payload required when question_id is absent")
        question_data = payload.question.model_dump(exclude_unset=True)
        if not question_data.get("school_id"):
            question_data["school_id"] = template.school_id
        question = QuestionBankQuestion(**question_data)
        session.add(question)
        await session.flush()

    if payload.question_order is not None:
        question_order = payload.question_order
    else:
        order_stmt = select(func.coalesce(func.max(QuizTemplateQuestion.question_order), 0)).where(
            QuizTemplateQuestion.quiz_template_id == template_id
        )
        max_order = (await session.execute(order_stmt)).scalar_one()
        question_order = max_order + 1

    template_question = QuizTemplateQuestion(
        quiz_template_id=template_id,
        question_id=question.id,
        question_order=question_order,
        override_score=payload.override_score,
        is_required=payload.is_required,
        randomize_options=payload.randomize_options,
        estimation_time_seconds=payload.estimation_time_seconds,
    )
    session.add(template_question)
    await session.commit()

    return await _load_template_question(session, template_id, template_question.id)


@router.patch("/{template_question_id}", response_model=TemplateQuestionRead)
async def update_template_question(
    template_id: uuid.UUID,
    template_question_id: uuid.UUID,
    payload: TemplateQuestionUpdate,
    session: AsyncSession = Depends(get_db),
) -> QuizTemplateQuestion:
    template_question = await _load_template_question(session, template_id, template_question_id)

    data = payload.model_dump(exclude_unset=True, exclude={"question"})
    for field, value in data.items():
        setattr(template_question, field, value)

    if payload.question:
        question_updates = payload.question.model_dump(exclude_unset=True)
        for field, value in question_updates.items():
            setattr(template_question.question, field, value)

    await session.commit()
    return await _load_template_question(session, template_id, template_question_id)


@router.delete("/{template_question_id}")
async def delete_template_question(
    template_id: uuid.UUID,
    template_question_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
) -> Response:
    template_question = await _load_template_question(session, template_id, template_question_id)
    await session.delete(template_question)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/reorder", response_model=list[TemplateQuestionRead])
async def reorder_template_questions(
    template_id: uuid.UUID,
    payload: TemplateQuestionReorderPayload,
    session: AsyncSession = Depends(get_db),
) -> list[QuizTemplateQuestion]:
    await _get_template(session, template_id)

    id_map = {item.id: item.question_order for item in payload.items}
    stmt = select(QuizTemplateQuestion).where(
        QuizTemplateQuestion.quiz_template_id == template_id,
        QuizTemplateQuestion.id.in_(list(id_map.keys())),
    )
    result = await session.execute(stmt)
    template_questions = result.scalars().all()
    if len(template_questions) != len(id_map):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more template question IDs are invalid")

    for tq in template_questions:
        tq.question_order = id_map[tq.id]

    await session.commit()
    return await list_template_questions(template_id, session=session)

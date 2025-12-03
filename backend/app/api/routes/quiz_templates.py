from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.quiz_template import QuizTemplate
from app.models.school import School
from app.schemas.quiz_template import QuizTemplateCreate, QuizTemplateRead

router = APIRouter(prefix="/quiz-templates", tags=["quiz_templates"])


@router.post("/", response_model=QuizTemplateRead, status_code=status.HTTP_201_CREATED)
async def create_quiz_template(payload: QuizTemplateCreate, session: AsyncSession = Depends(get_db)) -> QuizTemplate:
    if payload.school_id:
        school = await session.get(School, payload.school_id)
        if not school:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")

    template = QuizTemplate(**payload.model_dump(exclude_unset=True))
    session.add(template)
    await session.commit()
    await session.refresh(template)
    return template


@router.get("/", response_model=list[QuizTemplateRead])
async def list_quiz_templates(
    session: AsyncSession = Depends(get_db),
    school_id: uuid.UUID | None = Query(default=None),
) -> list[QuizTemplate]:
    stmt = select(QuizTemplate)
    if school_id:
        stmt = stmt.where(QuizTemplate.school_id == school_id)
    stmt = stmt.order_by(QuizTemplate.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/{template_id}", response_model=QuizTemplateRead)
async def get_quiz_template(template_id: uuid.UUID, session: AsyncSession = Depends(get_db)) -> QuizTemplate:
    template = await session.get(QuizTemplate, template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz template not found")
    return template

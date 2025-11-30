from __future__ import annotations

import uuid
from typing import List

from pydantic import Field

from app.schemas.base import ORMModel
from app.schemas.question import QuestionCreate, QuestionRead, QuestionUpdate


class TemplateQuestionCreate(ORMModel):
    question_id: uuid.UUID | None = None
    question: QuestionCreate | None = None
    question_order: int | None = None
    override_score: int | None = None
    is_required: bool = True
    randomize_options: bool = False
    estimation_time_seconds: int | None = None


class TemplateQuestionUpdate(ORMModel):
    question_order: int | None = None
    override_score: int | None = None
    is_required: bool | None = None
    randomize_options: bool | None = None
    estimation_time_seconds: int | None = None
    question: QuestionUpdate | None = None


class TemplateQuestionRead(ORMModel):
    id: uuid.UUID
    quiz_template_id: uuid.UUID
    question_order: int
    override_score: int | None = None
    is_required: bool
    randomize_options: bool
    estimation_time_seconds: int | None = None
    question: QuestionRead

    model_config = ORMModel.model_config


class TemplateQuestionReorderItem(ORMModel):
    id: uuid.UUID
    question_order: int


class TemplateQuestionReorderPayload(ORMModel):
    items: List[TemplateQuestionReorderItem] = Field(..., min_length=1)

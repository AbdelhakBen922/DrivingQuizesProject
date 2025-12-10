from __future__ import annotations

from datetime import datetime

from app.schemas.base import ORMModel


class AnswerBase(ORMModel):
    attempt_id: int
    question_id: int
    choice_id: int | None = None
    answer_text: str | None = None
    is_correct: bool | None = None
    answered_at: datetime | None = None


class AnswerCreate(AnswerBase):
    pass


class AnswerRead(AnswerBase):
    id: int

    model_config = ORMModel.model_config

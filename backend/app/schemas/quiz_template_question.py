from __future__ import annotations

from app.schemas.base import ORMModel


class QuizTemplateQuestionBase(ORMModel):
    template_id: int
    question_id: int
    position: int | None = None
    duration_sec: int | None = None
    is_required: bool = True
    randomize_options: bool = False
    estimation_time_seconds: int | None = None


class QuizTemplateQuestionCreate(QuizTemplateQuestionBase):
    pass


class QuizTemplateQuestionRead(QuizTemplateQuestionBase):
    id: int

    model_config = ORMModel.model_config


class QuizTemplateQuestionInput(ORMModel):
    question_id: int
    position: int | None = None
    duration_sec: int | None = None
    is_required: bool = True
    randomize_options: bool = False
    estimation_time_seconds: int | None = None

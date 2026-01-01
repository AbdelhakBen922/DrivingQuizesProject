from __future__ import annotations

from pydantic import model_validator

from app.schemas.base import ORMModel
from app.schemas.question import QuestionWithChoicesCreate, QuestionWithChoicesRead


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


class QuizTemplateQuestionWithQuestion(QuizTemplateQuestionBase):
    """Template question with full question details including choices"""
    id: int
    question: QuestionWithChoicesRead

    model_config = ORMModel.model_config


class QuizTemplateQuestionInput(ORMModel):
    question_id: int | None = None
    question: QuestionWithChoicesCreate | None = None
    position: int | None = None
    duration_sec: int | None = None
    is_required: bool = True
    randomize_options: bool = False
    estimation_time_seconds: int | None = None

    @model_validator(mode="after")
    def _ensure_question_reference(self) -> "QuizTemplateQuestionInput":
        if (self.question_id is None and self.question is None) or (
            self.question_id is not None and self.question is not None
        ):
            raise ValueError("Provide either question_id or question payload")
        return self

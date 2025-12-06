from __future__ import annotations

from app.schemas.base import ORMModel


class QuizQuestionBase(ORMModel):
	quiz_id: int
	question_id: int
	position: int | None = None
	duration_sec: int = 30
	is_required: bool = True


class QuizQuestionCreate(QuizQuestionBase):
	pass


class QuizQuestionRead(QuizQuestionBase):
	id: int

	model_config = ORMModel.model_config

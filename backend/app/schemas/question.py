from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import Field

from app.models.enums import QuestionCategory, QuestionDifficulty, QuestionType
from app.schemas.base import ORMModel
from app.schemas.choice import ChoiceRead


class QuestionBase(ORMModel):
	text: str
	image_url: str | None = None
	category: QuestionCategory
	type: QuestionType = QuestionType.SINGLE_CHOICE
	difficulty: QuestionDifficulty = QuestionDifficulty.MEDIUM
	is_required: bool = False
	score: int = 1
	explanation: str | None = None
	tags: dict[str, Any] = Field(default_factory=dict)
	version: int = 1


class QuestionCreate(QuestionBase):
	school_id: int | None = None
	author_id: int | None = None


class QuestionRead(QuestionBase):
	id: int
	school_id: int | None = None
	author_id: int | None = None
	created_at: datetime
	updated_at: datetime
	deleted_at: datetime | None = None

	model_config = ORMModel.model_config


class QuestionWithChoicesRead(QuestionRead):
	choices: list[ChoiceRead] = Field(default_factory=list)


class QuestionUpdate(ORMModel):
	text: str | None = None
	image_url: str | None = None
	category: QuestionCategory | None = None
	type: QuestionType | None = None
	difficulty: QuestionDifficulty | None = None
	is_required: bool | None = None
	score: int | None = None
	explanation: str | None = None
	tags: dict[str, Any] | None = None
	version: int | None = None
	school_id: int | None = None
	author_id: int | None = None


class QuestionChoiceInput(ORMModel):
	text: str
	is_correct: bool = False
	position: int | None = None


class QuestionWithChoicesCreate(QuestionBase):
	choices: list[QuestionChoiceInput]


class QuestionWithChoicesUpdate(QuestionUpdate):
	choices: list[QuestionChoiceInput] | None = None

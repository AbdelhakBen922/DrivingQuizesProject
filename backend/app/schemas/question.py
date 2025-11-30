from __future__ import annotations

import uuid
from typing import Any

from pydantic import Field

from app.models.enums import QuestionDifficulty
from app.schemas.base import ORMModel


class QuestionOption(ORMModel):
    id: str
    label: str
    image: str | None = None


class QuestionBase(ORMModel):
    category: str | None = None
    difficulty: QuestionDifficulty = QuestionDifficulty.MEDIUM
    question_text: str
    question_image_path: str | None = None
    options: list[dict[str, Any]] = Field(default_factory=list)
    correct_option_ids: list[str] = Field(default_factory=list)
    is_multiple_choice: bool = True
    score: int = 1
    explanation: str | None = None
    tags: list[str] = Field(default_factory=list)


class QuestionCreate(QuestionBase):
    school_id: uuid.UUID | None = None
    author_id: uuid.UUID | None = None


class QuestionUpdate(ORMModel):
    category: str | None = None
    difficulty: QuestionDifficulty | None = None
    question_text: str | None = None
    question_image_path: str | None = None
    options: list[dict[str, Any]] | None = None
    correct_option_ids: list[str] | None = None
    is_multiple_choice: bool | None = None
    score: int | None = None
    explanation: str | None = None
    tags: list[str] | None = None


class QuestionRead(QuestionBase):
    id: uuid.UUID
    school_id: uuid.UUID | None = None
    author_id: uuid.UUID | None = None
    version: int

    model_config = ORMModel.model_config

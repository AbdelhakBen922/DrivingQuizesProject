from __future__ import annotations

import uuid
from typing import Any

from pydantic import Field

from app.schemas.base import ORMModel


class QuizTemplateBase(ORMModel):
    title: str
    description: str | None = None
    total_time_seconds: int | None = None
    settings: dict[str, Any] | None = None
    visibility: str = Field(default="private", pattern="^(private|shared|public)$")


class QuizTemplateCreate(QuizTemplateBase):
    school_id: uuid.UUID | None = None
    created_by_id: uuid.UUID | None = None


class QuizTemplateRead(QuizTemplateBase):
    id: uuid.UUID
    school_id: uuid.UUID | None = None

    model_config = ORMModel.model_config

from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.schemas.base import ORMModel


class QuizTemplateBase(ORMModel):
    title: str
    description: str | None = None
    default_duration_sec: int | None = None
    settings: dict = Field(default_factory=dict)
    is_public: bool = False
    created_by_id: int | None = None


class QuizTemplateCreate(QuizTemplateBase):
    pass


class QuizTemplateUpdate(ORMModel):
    title: str | None = None
    description: str | None = None
    default_duration_sec: int | None = None
    settings: dict | None = None
    is_public: bool | None = None
    created_by_id: int | None = None

    model_config = ORMModel.model_config


class QuizTemplateRead(QuizTemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

    model_config = ORMModel.model_config

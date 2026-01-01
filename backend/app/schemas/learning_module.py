from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import Field

from app.schemas.base import ORMModel


class LearningModuleBase(ORMModel):
    created_by_id: int | None = None
    school_id: int | None = None
    title: str
    description: str | None = None
    content: dict[str, Any] = Field(default_factory=dict)
    tags: dict[str, Any] = Field(default_factory=dict)


class LearningModuleCreate(LearningModuleBase):
    pass


class LearningModuleUpdate(ORMModel):
    created_by_id: int | None = None
    school_id: int | None = None
    title: str | None = None
    description: str | None = None
    content: dict[str, Any] | None = None
    tags: dict[str, Any] | None = None

    model_config = ORMModel.model_config


class LearningModuleRead(LearningModuleBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

    model_config = ORMModel.model_config

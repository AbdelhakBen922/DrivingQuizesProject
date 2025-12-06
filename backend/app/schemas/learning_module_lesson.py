from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import Field

from app.schemas.base import ORMModel


class LearningModuleLessonBase(ORMModel):
    learning_module_id: int
    title: str
    content: dict[str, Any] = Field(default_factory=dict)
    order_index: int = 0


class LearningModuleLessonCreate(LearningModuleLessonBase):
    pass


class LearningModuleLessonRead(LearningModuleLessonBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ORMModel.model_config

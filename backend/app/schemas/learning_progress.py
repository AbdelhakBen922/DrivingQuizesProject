from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import Field

from app.schemas.base import ORMModel


class LearningProgressBase(ORMModel):
    student_id: int
    learning_module_id: int
    lesson_id: int | None = None
    completed: bool = False
    started_at: datetime | None = None
    completed_at: datetime | None = None
    progress_data: dict[str, Any] = Field(default_factory=dict)


class LearningProgressCreate(LearningProgressBase):
    pass


class LearningProgressRead(LearningProgressBase):
    id: int

    model_config = ORMModel.model_config

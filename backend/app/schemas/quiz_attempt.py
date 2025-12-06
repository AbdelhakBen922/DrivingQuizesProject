from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import Field

from app.schemas.base import ORMModel


class QuizAttemptBase(ORMModel):
    quiz_id: int
    room_member_id: int
    attempt_number: int = 1
    started_at: datetime | None = None
    finished_at: datetime | None = None
    score: int = 0
    time_spent_sec: int | None = None
    extra_metadata: dict[str, Any] = Field(default_factory=dict)


class QuizAttemptCreate(QuizAttemptBase):
    pass


class QuizAttemptRead(QuizAttemptBase):
    id: int

    model_config = ORMModel.model_config

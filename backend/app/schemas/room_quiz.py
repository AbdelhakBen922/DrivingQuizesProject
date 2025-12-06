from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import Field

from app.models.enums import RoomQuizStatus
from app.schemas.base import ORMModel


class RoomQuizBase(ORMModel):
    room_id: int
    quiz_id: int
    instance_settings: dict[str, Any] = Field(default_factory=dict)
    published_at: datetime | None = None
    status: RoomQuizStatus = RoomQuizStatus.ACTIVE


class RoomQuizCreate(RoomQuizBase):
    pass


class RoomQuizRead(RoomQuizBase):
    id: int

    model_config = ORMModel.model_config

from __future__ import annotations

from datetime import datetime

from app.models.enums import RoomType
from app.schemas.base import ORMModel


class RoomBase(ORMModel):
    school_id: int
    name: str
    description: str | None = None
    room_type: RoomType = RoomType.B
    created_by_id: int | None = None


class RoomCreate(RoomBase):
    pass


class RoomRead(RoomBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

    model_config = ORMModel.model_config

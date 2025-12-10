from __future__ import annotations

from datetime import datetime

from app.models.enums import RoomMembershipStatus
from app.schemas.base import ORMModel


class RoomMemberBase(ORMModel):
    room_id: int
    student_id: int | None = None
    joined_at: datetime | None = None
    left_at: datetime | None = None
    status: RoomMembershipStatus = RoomMembershipStatus.ACTIVE


class RoomMemberCreate(RoomMemberBase):
    pass


class RoomMemberAddRequest(ORMModel):
    student_id: int


class RoomMemberUpdate(ORMModel):
    room_id: int | None = None
    student_id: int | None = None
    joined_at: datetime | None = None
    left_at: datetime | None = None
    status: RoomMembershipStatus | None = None

    model_config = ORMModel.model_config


class RoomMemberRead(RoomMemberBase):
    id: int

    model_config = ORMModel.model_config

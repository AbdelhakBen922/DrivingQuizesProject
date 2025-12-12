from __future__ import annotations

from datetime import datetime

from app.models.enums import RoomMembershipStatus, RoomType
from app.schemas.base import ORMModel


class RoomBase(ORMModel):
    school_id: int
    name: str
    description: str | None = None
    room_type: RoomType = RoomType.B
    created_by_id: int | None = None


class RoomCreate(RoomBase):
    pass


class RoomCreateRequest(ORMModel):
    name: str
    description: str | None = None
    room_type: RoomType = RoomType.B


class RoomUpdate(ORMModel):
    school_id: int | None = None
    name: str | None = None
    description: str | None = None
    room_type: RoomType | None = None
    created_by_id: int | None = None

    model_config = ORMModel.model_config


class RoomRead(RoomBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

    model_config = ORMModel.model_config


class RoomStudentSummary(ORMModel):
    membership_id: int
    student_id: int | None
    full_name: str | None
    student_code: str | None
    email: str | None
    status: RoomMembershipStatus
    joined_at: datetime | None = None
    left_at: datetime | None = None


class RoomQuizSummary(ORMModel):
    id: int
    title_ar: str
    title_fr: str
    template_id: int | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None


class RoomDetail(ORMModel):
    room: RoomRead
    students: list[RoomStudentSummary]
    quizzes: list[RoomQuizSummary]

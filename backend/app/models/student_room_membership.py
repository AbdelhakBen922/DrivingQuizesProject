from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import RoomMembershipStatus, enum_values


class StudentRoomMembership(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "student_room_memberships"
    __table_args__ = (UniqueConstraint("student_id", "room_id", name="uq_student_room"),)

    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    room_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    left_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[RoomMembershipStatus] = mapped_column(
        Enum(RoomMembershipStatus, name="room_membership_status", values_callable=enum_values),
        nullable=False,
        default=RoomMembershipStatus.ACTIVE,
    )

    student: Mapped["Student"] = relationship(back_populates="memberships")
    room: Mapped["Room"] = relationship(back_populates="memberships")

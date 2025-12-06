from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin
from app.models.enums import RoomMembershipStatus, enum_values

if TYPE_CHECKING:
    from app.models.quiz_attempt import QuizAttempt
    from app.models.room import Room
    from app.models.student import Student


class RoomMember(BigIntPrimaryKeyMixin, Base):
    __tablename__ = "room_member"
    __table_args__ = (Index("uq_room_member_student", "room_id", "student_id", unique=True),)

    room_id: Mapped[int] = mapped_column(ForeignKey("room.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[int | None] = mapped_column(ForeignKey("student.id", ondelete="SET NULL"), nullable=True)
    joined_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    left_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[RoomMembershipStatus] = mapped_column(
        Enum(RoomMembershipStatus, name="room_member_status_enum", values_callable=enum_values),
        nullable=False,
        server_default=text(f"'{RoomMembershipStatus.ACTIVE.value}'"),
    )

    room: Mapped["Room"] = relationship(back_populates="members")
    student: Mapped["Student | None"] = relationship(back_populates="room_memberships")
    quiz_attempts: Mapped[list["QuizAttempt"]] = relationship(back_populates="room_member")

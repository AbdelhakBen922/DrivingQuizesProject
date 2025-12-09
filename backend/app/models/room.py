from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin
from app.models.enums import RoomType, enum_values

if TYPE_CHECKING:
    from app.models.room_member import RoomMember
    from app.models.room_quiz import RoomQuiz
    from app.models.school import School
    from app.models.staff_user import StaffUser


class Room(BigIntPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "room"

    school_id: Mapped[int] = mapped_column(ForeignKey("school.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    room_type: Mapped[RoomType] = mapped_column(
        Enum(RoomType, name="room_type", values_callable=enum_values),
        nullable=False,
        server_default=text(f"'{RoomType.B.value}'"),
    )
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("staff_user.id", ondelete="SET NULL"))

    school: Mapped["School"] = relationship(back_populates="rooms")
    created_by_user: Mapped["StaffUser | None"] = relationship(back_populates="created_rooms")
    members: Mapped[list["RoomMember"]] = relationship(back_populates="room", cascade="all, delete-orphan")
    room_quizzes: Mapped[list["RoomQuiz"]] = relationship(back_populates="room", cascade="all, delete-orphan")

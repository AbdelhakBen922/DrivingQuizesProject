from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin
from app.models.enums import RoomQuizStatus, enum_values

if TYPE_CHECKING:
    from app.models.quiz import Quiz
    from app.models.room import Room


class RoomQuiz(BigIntPrimaryKeyMixin, Base):
    __tablename__ = "room_quizze"
    __table_args__ = (Index("uq_room_quiz", "room_id", "quiz_id", unique=True),)

    room_id: Mapped[int] = mapped_column(ForeignKey("room.id", ondelete="CASCADE"), nullable=False)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizze.id", ondelete="CASCADE"), nullable=False)
    instance_settings: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    status: Mapped[RoomQuizStatus] = mapped_column(
        Enum(RoomQuizStatus, name="quiz_status_enum", values_callable=enum_values),
        nullable=False,
        server_default=text(f"'{RoomQuizStatus.ACTIVE.value}'"),
    )

    room: Mapped["Room"] = relationship(back_populates="room_quizzes")
    quiz: Mapped["Quiz"] = relationship(back_populates="room_quizzes")

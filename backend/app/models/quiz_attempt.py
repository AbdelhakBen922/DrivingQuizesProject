from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.answer import Answer
    from app.models.quiz import Quiz
    from app.models.room_member import RoomMember


class QuizAttempt(BigIntPrimaryKeyMixin, Base):
    __tablename__ = "quiz_attempt"
    __table_args__ = (
        Index("uq_quiz_attempt_unique", "quiz_id", "room_member_id", "attempt_number", unique=True),
        Index("ix_quiz_attempt_quiz", "quiz_id"),
        Index("ix_quiz_attempt_room_member", "room_member_id"),
        Index("ix_quiz_attempt_finished_at", "finished_at"),
    )

    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizze.id", ondelete="CASCADE"), nullable=False)
    room_member_id: Mapped[int] = mapped_column(ForeignKey("room_member.id", ondelete="CASCADE"), nullable=False)
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("1"))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    score: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    time_spent_sec: Mapped[int | None] = mapped_column(Integer)
    extra_metadata: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)

    quiz: Mapped["Quiz"] = relationship(back_populates="attempts")
    room_member: Mapped["RoomMember"] = relationship(back_populates="quiz_attempts")
    answers: Mapped[list["Answer"]] = relationship(back_populates="attempt", cascade="all, delete-orphan")

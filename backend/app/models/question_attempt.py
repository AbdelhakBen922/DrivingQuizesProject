from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, Index, Integer, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class QuestionAttempt(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "question_attempts"
    __table_args__ = (Index("ix_question_attempts_quiz", "quiz_attempt_id"), Index("ix_question_attempts_question", "question_id"))

    quiz_attempt_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("question_bank_questions.id", ondelete="CASCADE"), nullable=False)
    chosen_option_ids: Mapped[list[str]] = mapped_column(JSONB, server_default=text("'[]'::jsonb"), nullable=False)
    correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    time_spent_seconds: Mapped[int | None] = mapped_column(Integer)

    quiz_attempt: Mapped["QuizAttempt"] = relationship(back_populates="question_attempts")
    question: Mapped["QuestionBankQuestion"] = relationship(back_populates="question_attempts")

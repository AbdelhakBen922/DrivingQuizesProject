from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.choice import Choice
    from app.models.question import Question
    from app.models.quiz_attempt import QuizAttempt


class Answer(BigIntPrimaryKeyMixin, Base):
    __tablename__ = "answer"
    __table_args__ = (Index("uq_answer_attempt_question", "attempt_id", "question_id", unique=True),)

    attempt_id: Mapped[int] = mapped_column(ForeignKey("quiz_attempt.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[int] = mapped_column(ForeignKey("question.id", ondelete="CASCADE"), nullable=False)
    choice_id: Mapped[int | None] = mapped_column(ForeignKey("choice.id", ondelete="SET NULL"))
    answer_text: Mapped[str | None] = mapped_column(Text)
    is_correct: Mapped[bool | None] = mapped_column(Boolean)
    answered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    attempt: Mapped["QuizAttempt"] = relationship(back_populates="answers")
    question: Mapped["Question"] = relationship(back_populates="answers")
    choice: Mapped["Choice | None"] = relationship(back_populates="answers")

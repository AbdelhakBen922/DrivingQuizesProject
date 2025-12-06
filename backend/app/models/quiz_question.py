from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Index, Integer, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.question import Question
    from app.models.quiz import Quiz


class QuizQuestion(BigIntPrimaryKeyMixin, Base):
    __tablename__ = "quiz_question"
    __table_args__ = (Index("uq_quiz_question", "quiz_id", "question_id", unique=True),)

    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizze.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[int] = mapped_column(ForeignKey("question.id", ondelete="CASCADE"), nullable=False)
    position: Mapped[int | None] = mapped_column(Integer)
    duration_sec: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("30"))
    is_required: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

    quiz: Mapped["Quiz"] = relationship(back_populates="quiz_questions")
    question: Mapped["Question"] = relationship(back_populates="quiz_questions")

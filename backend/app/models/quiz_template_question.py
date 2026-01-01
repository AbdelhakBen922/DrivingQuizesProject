from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Index, Integer, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.question import Question
    from app.models.quiz_template import QuizTemplate


class QuizTemplateQuestion(BigIntPrimaryKeyMixin, Base):
    __tablename__ = "quiz_template_question"
    __table_args__ = (Index("uq_quiz_template_question", "template_id", "question_id", unique=True),)

    template_id: Mapped[int] = mapped_column(ForeignKey("quiz_template.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[int] = mapped_column(ForeignKey("question.id", ondelete="CASCADE"), nullable=False)
    position: Mapped[int | None] = mapped_column(Integer)
    duration_sec: Mapped[int | None] = mapped_column(Integer)
    is_required: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    randomize_options: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    estimation_time_seconds: Mapped[int | None] = mapped_column(Integer)

    template: Mapped["QuizTemplate"] = relationship(back_populates="template_questions")
    question: Mapped["Question"] = relationship(back_populates="template_questions")

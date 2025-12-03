from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, Index, Integer, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class QuizTemplateQuestion(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "quiz_template_questions"
    __table_args__ = (
        UniqueConstraint("quiz_template_id", "question_id", name="uq_template_question"),
        Index("ix_template_questions_order", "quiz_template_id", "question_order"),
    )

    quiz_template_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quiz_templates.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("question_bank_questions.id", ondelete="CASCADE"), nullable=False)
    question_order: Mapped[int] = mapped_column(Integer, nullable=False)
    override_score: Mapped[int | None] = mapped_column(Integer)
    is_required: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    randomize_options: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    estimation_time_seconds: Mapped[int | None] = mapped_column(Integer)

    quiz_template: Mapped["QuizTemplate"] = relationship(back_populates="template_questions")
    question: Mapped["QuestionBankQuestion"] = relationship(back_populates="template_links")

from __future__ import annotations

import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import QuestionDifficulty, enum_values


class QuestionBankQuestion(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "question_bank_questions"
    __table_args__ = (
        Index("ix_qbq_school", "school_id"),
        Index("ix_qbq_category", "category"),
        Index("ix_qbq_difficulty", "difficulty"),
    )

    school_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("schools.id", ondelete="CASCADE"), nullable=True)
    author_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("staff_users.id", ondelete="SET NULL"))
    category: Mapped[str | None] = mapped_column(String(100))
    difficulty: Mapped[QuestionDifficulty] = mapped_column(
        Enum(QuestionDifficulty, name="question_difficulty", values_callable=enum_values), nullable=False
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_image_path: Mapped[str | None] = mapped_column(String(500))
    options: Mapped[list[dict]] = mapped_column(JSONB, server_default=text("'[]'::jsonb"), nullable=False)
    correct_option_ids: Mapped[list[str]] = mapped_column(JSONB, server_default=text("'[]'::jsonb"), nullable=False)
    is_multiple_choice: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    explanation: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[list[str]] = mapped_column(JSONB, server_default=text("'[]'::jsonb"), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    school: Mapped["School | None"] = relationship(back_populates="question_bank_questions")
    author: Mapped["StaffUser | None"] = relationship(back_populates="authored_questions")
    template_links: Mapped[list["QuizTemplateQuestion"]] = relationship(back_populates="question")
    question_attempts: Mapped[list["QuestionAttempt"]] = relationship(back_populates="question")

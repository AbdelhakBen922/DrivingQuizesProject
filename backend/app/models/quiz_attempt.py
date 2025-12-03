from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import QuizAttemptStatus, enum_values


class QuizAttempt(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "quiz_attempts"
    __table_args__ = (
        Index("ix_quiz_attempt_student", "student_id"),
        Index("ix_quiz_attempt_room_instance", "room_quiz_instance_id"),
        Index("ix_quiz_attempt_template", "quiz_template_id"),
    )

    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    room_quiz_instance_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("room_quiz_instances.id", ondelete="SET NULL"))
    quiz_template_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quiz_templates.id", ondelete="CASCADE"), nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[QuizAttemptStatus] = mapped_column(
        Enum(QuizAttemptStatus, name="quiz_attempt_status", values_callable=enum_values),
        nullable=False,
        default=QuizAttemptStatus.IN_PROGRESS,
    )
    answer_payload: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    score_value: Mapped[float | None] = mapped_column(Numeric(6, 2))
    passed: Mapped[bool | None] = mapped_column(Boolean)
    ip_address: Mapped[str | None] = mapped_column(String(50))
    user_agent: Mapped[str | None] = mapped_column(String(255))

    student: Mapped["Student"] = relationship(back_populates="quiz_attempts")
    room_quiz_instance: Mapped["RoomQuizInstance | None"] = relationship(back_populates="quiz_attempts")
    quiz_template: Mapped["QuizTemplate"] = relationship(back_populates="quiz_attempts")
    question_attempts: Mapped[list["QuestionAttempt"]] = relationship(back_populates="quiz_attempt", cascade="all, delete-orphan")

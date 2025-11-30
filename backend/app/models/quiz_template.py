from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class QuizTemplate(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "quiz_templates"
    __table_args__ = (Index("ix_quiz_templates_school", "school_id"),)

    school_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("schools.id", ondelete="SET NULL"))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    total_time_seconds: Mapped[int | None] = mapped_column(Integer)
    settings: Mapped[dict] = mapped_column(
        JSONB,
            server_default=text("'{}'::jsonb"),
        nullable=False,
    )
    visibility: Mapped[str] = mapped_column(String(50), nullable=False, default="private")
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("staff_users.id", ondelete="SET NULL"))

    school: Mapped["School | None"] = relationship(back_populates="quiz_templates")
    created_by_user: Mapped["StaffUser | None"] = relationship(back_populates="created_quiz_templates")
    template_questions: Mapped[list["QuizTemplateQuestion"]] = relationship(
        back_populates="quiz_template", cascade="all, delete-orphan", order_by="QuizTemplateQuestion.question_order"
    )
    room_instances: Mapped[list["RoomQuizInstance"]] = relationship(back_populates="quiz_template")
    quiz_attempts: Mapped[list["QuizAttempt"]] = relationship(back_populates="quiz_template")

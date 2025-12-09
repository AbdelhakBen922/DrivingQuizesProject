from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.quiz import Quiz
    from app.models.quiz_template_question import QuizTemplateQuestion
    from app.models.staff_user import StaffUser


class QuizTemplate(BigIntPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "quiz_template"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    default_duration_sec: Mapped[int | None] = mapped_column(Integer)
    settings: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("staff_user.id", ondelete="SET NULL"))

    created_by_user: Mapped["StaffUser | None"] = relationship(back_populates="created_templates")
    template_questions: Mapped[list["QuizTemplateQuestion"]] = relationship(
        back_populates="template", cascade="all, delete-orphan"
    )
    quizzes: Mapped[list["Quiz"]] = relationship(back_populates="template")

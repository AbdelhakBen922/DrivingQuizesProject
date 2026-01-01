from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin
from app.models.enums import QuestionDifficulty, enum_values

if TYPE_CHECKING:
    from app.models.quiz import Quiz
    from app.models.quiz_template_question import QuizTemplateQuestion
    from app.models.school import School
    from app.models.staff_user import StaffUser


class QuizTemplate(BigIntPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "quiz_template"

    school_id: Mapped[int | None] = mapped_column(ForeignKey("school.id", ondelete="SET NULL"))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    title_ar: Mapped[str | None] = mapped_column(String(255))
    title_fr: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    description_ar: Mapped[str | None] = mapped_column(Text)
    description_fr: Mapped[str | None] = mapped_column(Text)
    topic_id: Mapped[int | None] = mapped_column(Integer)
    difficulty: Mapped[QuestionDifficulty] = mapped_column(
        Enum(QuestionDifficulty, name="question_difficulty_enum", values_callable=enum_values),
        nullable=False,
        server_default=text(f"'{QuestionDifficulty.MEDIUM.value}'"),
    )
    default_duration_sec: Mapped[int | None] = mapped_column(Integer)
    settings: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("staff_user.id", ondelete="SET NULL"))

    school: Mapped["School | None"] = relationship(back_populates="quiz_templates")
    created_by_user: Mapped["StaffUser | None"] = relationship(back_populates="created_templates")
    template_questions: Mapped[list["QuizTemplateQuestion"]] = relationship(
        back_populates="template", cascade="all, delete-orphan"
    )
    quizzes: Mapped[list["Quiz"]] = relationship(back_populates="template")

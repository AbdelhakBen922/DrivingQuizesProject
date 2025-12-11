from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, Text, text as sql_text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin
from app.models.enums import QuestionCategory, QuestionDifficulty, QuestionType, enum_values

if TYPE_CHECKING:
    from app.models.answer import Answer
    from app.models.choice import Choice
    from app.models.quiz_template_question import QuizTemplateQuestion
    from app.models.school import School
    from app.models.staff_user import StaffUser


class Question(BigIntPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "question"

    school_id: Mapped[int | None] = mapped_column(ForeignKey("school.id", ondelete="SET NULL"))
    author_id: Mapped[int | None] = mapped_column(ForeignKey("staff_user.id", ondelete="SET NULL"))
    text: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str | None] = mapped_column(Text)
    category: Mapped[QuestionCategory] = mapped_column(
        Enum(QuestionCategory, name="question_category_enum", values_callable=enum_values), nullable=False
    )
    type: Mapped[QuestionType] = mapped_column(
        Enum(QuestionType, name="question_type_enum", values_callable=enum_values),
        nullable=False,
        server_default=sql_text(f"'{QuestionType.SINGLE_CHOICE.value}'"),
    )
    difficulty: Mapped[QuestionDifficulty] = mapped_column(
        Enum(QuestionDifficulty, name="question_difficulty_enum", values_callable=enum_values),
        nullable=False,
        server_default=sql_text(f"'{QuestionDifficulty.MEDIUM.value}'"),
    )
    is_required: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=sql_text("false"))
    score: Mapped[int] = mapped_column(Integer, nullable=False, server_default=sql_text("1"))
    explanation: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[dict] = mapped_column(JSONB, server_default=sql_text("'{}'::jsonb"), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, server_default=sql_text("1"))

    school: Mapped["School | None"] = relationship(back_populates="questions")
    author: Mapped["StaffUser | None"] = relationship(back_populates="authored_questions")
    choices: Mapped[list["Choice"]] = relationship(back_populates="question", cascade="all, delete-orphan")
    template_questions: Mapped[list["QuizTemplateQuestion"]] = relationship(back_populates="question")
    answers: Mapped[list["Answer"]] = relationship(back_populates="question")

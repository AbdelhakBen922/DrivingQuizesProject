from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin, TimestampMixin
from app.models.enums import StaffRole, enum_values
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.learning_module import LearningModule
    from app.models.question import Question
    from app.models.quiz import Quiz
    from app.models.quiz_template import QuizTemplate
    from app.models.room import Room
    from app.models.school import School
    from app.models.student import Student


class StaffUser(BigIntPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "staff_user"
    __table_args__ = (
        Index("ix_staff_user_school", "school_id"),
        Index("ix_staff_user_email", "email", unique=True),
    )

    school_id: Mapped[int] = mapped_column(ForeignKey("school.id", ondelete="CASCADE"), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[StaffRole] = mapped_column(
        Enum(StaffRole, name="staff_user_role_enum", values_callable=enum_values), nullable=False
    )
    first_name: Mapped[str | None] = mapped_column(String(255))
    last_name: Mapped[str | None] = mapped_column(String(255))
    name: Mapped[str | None] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

    school: Mapped["School"] = relationship(back_populates="staff_users")
    created_students: Mapped[list["Student"]] = relationship(back_populates="created_by_user")
    authored_questions: Mapped[list["Question"]] = relationship(back_populates="author")
    created_quizzes: Mapped[list["Quiz"]] = relationship(back_populates="created_by_user")
    created_rooms: Mapped[list["Room"]] = relationship(back_populates="created_by_user")
    created_templates: Mapped[list["QuizTemplate"]] = relationship(back_populates="created_by_user")
    learning_modules: Mapped[list["LearningModule"]] = relationship(back_populates="created_by_user")

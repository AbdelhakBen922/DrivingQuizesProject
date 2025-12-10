from __future__ import annotations

from sqlalchemy import ForeignKey, Index, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.learning_module import LearningModule
    from app.models.plan import Plan
    from app.models.quiz import Quiz
    from app.models.quiz_template import QuizTemplate
    from app.models.question import Question
    from app.models.room import Room
    from app.models.staff_user import StaffUser
    from app.models.student import Student


class School(BigIntPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "school"
    __table_args__ = (
        UniqueConstraint("registration_number", name="uq_school_registration"),
        UniqueConstraint("email", name="uq_school_email"),
        Index("ix_school_plan_id", "plan_id"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    legal_name: Mapped[str | None] = mapped_column(String(255))
    registration_number: Mapped[str | None] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    password: Mapped[str] = mapped_column(Text, nullable=False)
    timezone: Mapped[str | None] = mapped_column(String(50))
    locale: Mapped[str | None] = mapped_column(String(10))
    address: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    language_defaults: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    plan_id: Mapped[int | None] = mapped_column(ForeignKey("plan.id", ondelete="SET NULL"), nullable=True)
    billing_info: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    settings: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)

    plan: Mapped["Plan | None"] = relationship(back_populates="schools")
    staff_users: Mapped[list["StaffUser"]] = relationship(back_populates="school", cascade="all, delete-orphan")
    students: Mapped[list["Student"]] = relationship(back_populates="school", cascade="all, delete-orphan")
    questions: Mapped[list["Question"]] = relationship(back_populates="school")
    quizzes: Mapped[list["Quiz"]] = relationship(back_populates="school")
    quiz_templates: Mapped[list["QuizTemplate"]] = relationship(back_populates="school")
    rooms: Mapped[list["Room"]] = relationship(back_populates="school", cascade="all, delete-orphan")
    learning_modules: Mapped[list["LearningModule"]] = relationship(
        back_populates="school", cascade="all, delete-orphan"
    )

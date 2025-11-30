from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Index, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.plan import Plan
    from app.models.staff_user import StaffUser
    from app.models.student import Student
    from app.models.quiz_template import QuizTemplate
    from app.models.room import Room
    from app.models.question_bank_question import QuestionBankQuestion

class School(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "schools"
    __table_args__ = (
        UniqueConstraint("registration_number", name="uq_schools_registration"),
        Index("ix_schools_plan_id", "plan_id"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    legal_name: Mapped[str | None] = mapped_column(String(255))
    registration_number: Mapped[str | None] = mapped_column(String(100))
    address: Mapped[str | None] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(String(50))
    email: Mapped[str | None] = mapped_column(String(255))
    timezone: Mapped[str | None] = mapped_column(String(100))
    locale: Mapped[str | None] = mapped_column(String(50))
    language_defaults: Mapped[str | None] = mapped_column(String(50))
    plan_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("plans.id", ondelete="SET NULL"), nullable=True
    )
    billing_info: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    settings: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)

    plan: Mapped["Plan | None"] = relationship(back_populates="schools")
    staff_users: Mapped[list["StaffUser"]] = relationship(back_populates="school")
    students: Mapped[list["Student"]] = relationship(back_populates="school")
    quiz_templates: Mapped[list["QuizTemplate"]] = relationship(back_populates="school")
    rooms: Mapped[list["Room"]] = relationship(back_populates="school")
    question_bank_questions: Mapped[list["QuestionBankQuestion"]] = relationship(back_populates="school")

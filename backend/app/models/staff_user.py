from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import StaffRole, enum_values


class StaffUser(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "staff_users"
    __table_args__ = (Index("ix_staff_school", "school_id"), Index("ix_staff_email", "email", unique=True))

    school_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[StaffRole] = mapped_column(
        Enum(StaffRole, name="staff_role", values_callable=enum_values), nullable=False
    )
    name: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    school: Mapped["School"] = relationship(back_populates="staff_users")
    created_students: Mapped[list["Student"]] = relationship(back_populates="created_by_user")
    authored_questions: Mapped[list["QuestionBankQuestion"]] = relationship(back_populates="author")
    created_quiz_templates: Mapped[list["QuizTemplate"]] = relationship(back_populates="created_by_user")
    created_rooms: Mapped[list["Room"]] = relationship(back_populates="created_by_user")
    room_quiz_instances: Mapped[list["RoomQuizInstance"]] = relationship(back_populates="created_by_user")

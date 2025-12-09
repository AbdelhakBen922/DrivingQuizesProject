from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Index, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.learning_progress import LearningProgress
    from app.models.room_member import RoomMember
    from app.models.school import School
    from app.models.staff_user import StaffUser


class Student(BigIntPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "student"
    __table_args__ = (
        UniqueConstraint("school_id", "student_code", name="uq_student_school_code"),
        Index("ix_student_school", "school_id"),
    )

    school_id: Mapped[int] = mapped_column(ForeignKey("school.id", ondelete="CASCADE"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    student_code: Mapped[str] = mapped_column(String(20), nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    dob: Mapped[date | None] = mapped_column(Date)
    national_id: Mapped[str | None] = mapped_column(String(50))
    phone: Mapped[str | None] = mapped_column(String(50))
    email: Mapped[str | None] = mapped_column(String(255))
    profile_data: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    created_by_id: Mapped[int | None] = mapped_column(
        "created_by", ForeignKey("staff_user.id", ondelete="SET NULL"), nullable=True
    )

    school: Mapped["School"] = relationship(back_populates="students")
    created_by_user: Mapped["StaffUser | None"] = relationship(back_populates="created_students")
    room_memberships: Mapped[list["RoomMember"]] = relationship(back_populates="student")
    learning_progress_records: Mapped[list["LearningProgress"]] = relationship(back_populates="student")

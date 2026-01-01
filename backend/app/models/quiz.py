from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.quiz_attempt import QuizAttempt
    from app.models.quiz_setting import QuizSetting
    from app.models.quiz_template import QuizTemplate
    from app.models.room import Room
    from app.models.school import School
    from app.models.staff_user import StaffUser


class Quiz(BigIntPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "quizze"

    school_id: Mapped[int | None] = mapped_column(ForeignKey("school.id", ondelete="SET NULL"))
    setting_id: Mapped[int | None] = mapped_column(
        ForeignKey("quiz_setting.id", ondelete="CASCADE"), unique=True
    )
    room_id: Mapped[int | None] = mapped_column(ForeignKey("room.id", ondelete="SET NULL"))
    template_id: Mapped[int | None] = mapped_column(ForeignKey("quiz_template.id", ondelete="SET NULL"))
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    title_ar: Mapped[str] = mapped_column(String(255), nullable=False)
    title_fr: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("staff_user.id", ondelete="SET NULL"))

    school: Mapped["School | None"] = relationship(back_populates="quizzes")
    setting: Mapped["QuizSetting | None"] = relationship(
        back_populates="quiz", cascade="all, delete-orphan", uselist=False, single_parent=True
    )
    template: Mapped["QuizTemplate | None"] = relationship(back_populates="quizzes")
    created_by_user: Mapped["StaffUser | None"] = relationship(back_populates="created_quizzes")
    room: Mapped["Room | None"] = relationship(back_populates="quizzes")
    attempts: Mapped[list["QuizAttempt"]] = relationship(back_populates="quiz")

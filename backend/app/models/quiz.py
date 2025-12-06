from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.quiz_attempt import QuizAttempt
    from app.models.quiz_question import QuizQuestion
    from app.models.quiz_setting import QuizSetting
    from app.models.room_quiz import RoomQuiz
    from app.models.school import School
    from app.models.staff_user import StaffUser


class Quiz(BigIntPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "quizze"

    school_id: Mapped[int | None] = mapped_column(ForeignKey("school.id", ondelete="SET NULL"))
    setting_id: Mapped[int | None] = mapped_column(
        ForeignKey("quiz_setting.id", ondelete="CASCADE"), unique=True
    )
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    total_time_seconds: Mapped[int | None] = mapped_column(Integer)
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("staff_user.id", ondelete="SET NULL"))

    school: Mapped["School | None"] = relationship(back_populates="quizzes")
    setting: Mapped["QuizSetting | None"] = relationship(
        back_populates="quiz", cascade="all, delete-orphan", uselist=False, single_parent=True
    )
    created_by_user: Mapped["StaffUser | None"] = relationship(back_populates="created_quizzes")
    quiz_questions: Mapped[list["QuizQuestion"]] = relationship(back_populates="quiz")
    room_quizzes: Mapped[list["RoomQuiz"]] = relationship(back_populates="quiz")
    attempts: Mapped[list["QuizAttempt"]] = relationship(back_populates="quiz")

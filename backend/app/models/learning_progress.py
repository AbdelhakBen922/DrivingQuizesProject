from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.learning_module import LearningModule
    from app.models.learning_module_lesson import LearningModuleLesson
    from app.models.student import Student


class LearningProgress(BigIntPrimaryKeyMixin, Base):
    __tablename__ = "learning_progress"
    __table_args__ = (Index("uq_learning_progress_student_module", "student_id", "learning_module_id", unique=True),)

    student_id: Mapped[int] = mapped_column(ForeignKey("student.id", ondelete="CASCADE"), nullable=False)
    learning_module_id: Mapped[int] = mapped_column(ForeignKey("learning_module.id", ondelete="CASCADE"), nullable=False)
    lesson_id: Mapped[int | None] = mapped_column(ForeignKey("learning_module_lesson.id", ondelete="SET NULL"))
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    progress_data: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)

    student: Mapped["Student"] = relationship(back_populates="learning_progress_records")
    learning_module: Mapped["LearningModule"] = relationship(back_populates="progress_records")
    lesson: Mapped["LearningModuleLesson | None"] = relationship(back_populates="progress_records")

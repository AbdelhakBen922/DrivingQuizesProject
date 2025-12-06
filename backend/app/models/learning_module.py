from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.learning_module_lesson import LearningModuleLesson
    from app.models.learning_progress import LearningProgress
    from app.models.school import School
    from app.models.staff_user import StaffUser


class LearningModule(BigIntPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "learning_module"

    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("staff_user.id", ondelete="SET NULL"))
    school_id: Mapped[int | None] = mapped_column(ForeignKey("school.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    content: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    tags: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)

    created_by_user: Mapped["StaffUser | None"] = relationship(back_populates="learning_modules")
    school: Mapped["School | None"] = relationship(back_populates="learning_modules")
    lessons: Mapped[list["LearningModuleLesson"]] = relationship(
        back_populates="learning_module", cascade="all, delete-orphan"
    )
    progress_records: Mapped[list["LearningProgress"]] = relationship(back_populates="learning_module")

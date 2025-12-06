from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.learning_module import LearningModule
    from app.models.learning_progress import LearningProgress


class LearningModuleLesson(BigIntPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "learning_module_lesson"
    __table_args__ = (Index("uq_learning_module_lesson_order", "learning_module_id", "order_index", unique=True),)

    learning_module_id: Mapped[int] = mapped_column(ForeignKey("learning_module.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))

    learning_module: Mapped["LearningModule"] = relationship(back_populates="lessons")
    progress_records: Mapped[list["LearningProgress"]] = relationship(back_populates="lesson")

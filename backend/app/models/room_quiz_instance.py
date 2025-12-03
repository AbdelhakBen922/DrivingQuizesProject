from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class RoomQuizInstance(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "room_quiz_instances"
    __table_args__ = (Index("ix_room_quiz_room", "room_id"), Index("ix_room_quiz_template", "quiz_template_id"))

    room_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    quiz_template_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quiz_templates.id", ondelete="CASCADE"), nullable=False)
    instance_settings: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    assigned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("staff_users.id", ondelete="SET NULL"))

    room: Mapped["Room"] = relationship(back_populates="room_quiz_instances")
    quiz_template: Mapped["QuizTemplate"] = relationship(back_populates="room_instances")
    created_by_user: Mapped["StaffUser | None"] = relationship(back_populates="room_quiz_instances")
    quiz_attempts: Mapped[list["QuizAttempt"]] = relationship(back_populates="room_quiz_instance")

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import NotificationRecipientType, enum_values


class Notification(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "notifications"
    __table_args__ = (Index("ix_notification_recipient", "recipient_type", "recipient_id"),)

    recipient_type: Mapped[NotificationRecipientType] = mapped_column(
        Enum(NotificationRecipientType, name="notification_recipient", values_callable=enum_values), nullable=False
    )
    recipient_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    notification_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

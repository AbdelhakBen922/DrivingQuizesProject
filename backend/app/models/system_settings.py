from __future__ import annotations

from sqlalchemy import String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class SystemSettings(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "system_settings"

    rousseau_reference_version: Mapped[str | None] = mapped_column(String(50))
    default_language: Mapped[str | None] = mapped_column(String(10))
    global_limits: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    allowed_file_types: Mapped[list[str]] = mapped_column(JSONB, server_default=text("'[]'::jsonb"), nullable=False)

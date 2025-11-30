from __future__ import annotations

import uuid

from sqlalchemy import BigInteger, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class FileStorageRecord(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "file_storage_records"
    __table_args__ = (Index("ix_file_owner", "owner_type", "owner_id"),)

    owner_type: Mapped[str] = mapped_column(String(50), nullable=False)
    owner_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    path: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str | None] = mapped_column(String(100))
    size: Mapped[int | None] = mapped_column(BigInteger)
    checksum: Mapped[str | None] = mapped_column(String(128))

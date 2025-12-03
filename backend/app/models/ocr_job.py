from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import OCRJobStatus, enum_values
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.file_storage_record import FileStorageRecord
    from app.models.school import School


class OCRJob(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ocr_jobs"
    __table_args__ = (Index("ix_ocr_school", "school_id"),)

    school_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("schools.id", ondelete="SET NULL"))
    file_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("file_storage_records.id", ondelete="SET NULL"))
    status: Mapped[OCRJobStatus] = mapped_column(
        Enum(OCRJobStatus, name="ocr_job_status", values_callable=enum_values),
        nullable=False,
        default=OCRJobStatus.PENDING,
    )
    result: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    school: Mapped["School | None"] = relationship()
    file: Mapped["FileStorageRecord | None"] = relationship()

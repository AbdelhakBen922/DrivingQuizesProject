from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, Index, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import AIAnalysisStatus, enum_values


class AIAnalysisJob(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ai_analysis_jobs"
    __table_args__ = (Index("ix_ai_jobs_school", "school_id"),)

    school_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("schools.id", ondelete="SET NULL"))
    payload: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    status: Mapped[AIAnalysisStatus] = mapped_column(
        Enum(AIAnalysisStatus, name="ai_analysis_status", values_callable=enum_values),
        nullable=False,
        default=AIAnalysisStatus.PENDING,
    )
    result: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    cost_estimate: Mapped[float | None] = mapped_column(Numeric(10, 2))
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    school: Mapped["School | None"] = relationship()

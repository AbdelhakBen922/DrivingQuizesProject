from __future__ import annotations

from sqlalchemy import Enum, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import PlanTier, enum_values
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.school import School

class Plan(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "plans"

    name: Mapped[PlanTier] = mapped_column(
        Enum(PlanTier, name="plan_tier", values_callable=enum_values), nullable=False, unique=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    monthly_price_cents: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    features: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    limits: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)

    schools: Mapped[list["School"]] = relationship(back_populates="plan")

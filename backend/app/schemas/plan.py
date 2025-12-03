from __future__ import annotations

import uuid
from typing import Any

from app.models.enums import PlanTier
from app.schemas.base import ORMModel


class PlanRead(ORMModel):
    id: uuid.UUID
    name: PlanTier
    description: str | None = None
    monthly_price_cents: int
    features: dict[str, Any]
    limits: dict[str, Any]

    model_config = ORMModel.model_config

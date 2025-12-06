from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import Field

from app.models.enums import PlanTier
from app.schemas.base import ORMModel


class PlanBase(ORMModel):
	name: PlanTier
	description: str | None = None
	price_monthly: Decimal | None = None
	max_students: int | None = None
	max_staff_users: int | None = None
	max_rooms: int | None = None
	max_questions_per_quiz: int | None = None
	features: dict[str, Any] = Field(default_factory=dict)
	is_active: bool = True


class PlanCreate(PlanBase):
	pass


class PlanRead(PlanBase):
	id: int
	created_at: datetime
	updated_at: datetime

	model_config = ORMModel.model_config

from __future__ import annotations

import uuid
from typing import Any

from pydantic import EmailStr, Field

from app.schemas.base import ORMModel
from app.schemas.plan import PlanRead


class SchoolBase(ORMModel):
    name: str = Field(..., max_length=255)
    legal_name: str | None = None
    registration_number: str | None = Field(default=None, max_length=100)
    address: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    timezone: str | None = None
    locale: str | None = None
    language_defaults: str | None = None
    plan_id: uuid.UUID | None = None
    billing_info: dict[str, Any] | None = None
    settings: dict[str, Any] | None = None


class SchoolCreate(SchoolBase):
    pass


class SchoolRead(SchoolBase):
    id: uuid.UUID
    plan: PlanRead | None = None

    model_config = ORMModel.model_config

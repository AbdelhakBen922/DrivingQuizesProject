from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import EmailStr, Field

from app.schemas.base import ORMModel
from app.schemas.plan import PlanRead


class SchoolBase(ORMModel):
	name: str = Field(..., max_length=255)
	legal_name: str | None = Field(default=None, max_length=255)
	registration_number: str | None = Field(default=None, max_length=100)
	email: EmailStr
	timezone: str | None = Field(default=None, max_length=50)
	locale: str | None = Field(default=None, max_length=10)
	address: str | None = Field(default=None, max_length=255)
	phone: str | None = Field(default=None, max_length=50)
	language_defaults: dict[str, Any] = Field(default_factory=dict)
	plan_id: int | None = None
	billing_info: dict[str, Any] = Field(default_factory=dict)
	settings: dict[str, Any] = Field(default_factory=dict)


class SchoolCreate(SchoolBase):
	password: str = Field(..., min_length=8)


class SchoolUpdate(ORMModel):
	name: str | None = Field(default=None, max_length=255)
	legal_name: str | None = Field(default=None, max_length=255)
	registration_number: str | None = Field(default=None, max_length=100)
	email: EmailStr | None = None
	timezone: str | None = Field(default=None, max_length=50)
	locale: str | None = Field(default=None, max_length=10)
	address: str | None = Field(default=None, max_length=255)
	phone: str | None = Field(default=None, max_length=50)
	language_defaults: dict[str, Any] | None = None
	plan_id: int | None = None
	billing_info: dict[str, Any] | None = None
	settings: dict[str, Any] | None = None


class SchoolRead(SchoolBase):
	id: int
	created_at: datetime
	updated_at: datetime
	deleted_at: datetime | None = None
	plan: PlanRead | None = None

	model_config = ORMModel.model_config

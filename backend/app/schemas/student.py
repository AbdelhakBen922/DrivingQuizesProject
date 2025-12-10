from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import EmailStr, Field

from app.schemas.base import ORMModel


class StudentBase(ORMModel):
	full_name: str = Field(..., max_length=255)
	student_code: str = Field(..., max_length=20)
	password_hash: str = Field(..., min_length=8)
	dob: date | None = None
	national_id: str | None = Field(default=None, max_length=50)
	phone: str | None = Field(default=None, max_length=50)
	email: EmailStr | None = None
	profile_data: dict[str, Any] = Field(default_factory=dict)


class StudentCreate(StudentBase):
	school_id: int
	created_by_id: int | None = None


class StudentCreateRequest(ORMModel):
	full_name: str = Field(..., max_length=255)
	student_code: str = Field(..., max_length=20)
	password: str = Field(..., min_length=8)
	dob: date | None = None
	national_id: str | None = Field(default=None, max_length=50)
	phone: str | None = Field(default=None, max_length=50)
	email: EmailStr | None = None
	profile_data: dict[str, Any] | None = None


class StudentRead(StudentBase):
	id: int
	school_id: int
	created_by_id: int | None = None
	created_at: datetime
	updated_at: datetime
	deleted_at: datetime | None = None

	model_config = ORMModel.model_config


class StudentUpdate(ORMModel):
	full_name: str | None = Field(default=None, max_length=255)
	student_code: str | None = Field(default=None, max_length=20)
	password_hash: str | None = Field(default=None, min_length=8)
	dob: date | None = None
	national_id: str | None = Field(default=None, max_length=50)
	phone: str | None = Field(default=None, max_length=50)
	email: EmailStr | None = None
	profile_data: dict[str, Any] | None = None
	school_id: int | None = None
	created_by_id: int | None = None


class StudentUpdateRequest(ORMModel):
	full_name: str | None = Field(default=None, max_length=255)
	student_code: str | None = Field(default=None, max_length=20)
	password: str | None = Field(default=None, min_length=8)
	dob: date | None = None
	national_id: str | None = Field(default=None, max_length=50)
	phone: str | None = Field(default=None, max_length=50)
	email: EmailStr | None = None
	profile_data: dict[str, Any] | None = None

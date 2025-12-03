from __future__ import annotations

import uuid
from datetime import date
from typing import Any

from pydantic import EmailStr, Field

from app.schemas.base import ORMModel


class StudentBase(ORMModel):
    full_name: str = Field(..., max_length=255)
    dob: date | None = None # dob: date of birth
    student_code: str = Field(..., max_length=50)
    national_id: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    profile_data: dict[str, Any] | None = None


class StudentCreate(StudentBase):
    school_id: uuid.UUID
    created_by_id: uuid.UUID | None = None


class StudentRead(StudentBase):
    id: uuid.UUID
    school_id: uuid.UUID

    model_config = ORMModel.model_config

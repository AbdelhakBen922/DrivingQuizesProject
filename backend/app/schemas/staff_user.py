from __future__ import annotations

from datetime import datetime

from pydantic import EmailStr, Field

from app.models.enums import StaffRole
from app.schemas.base import ORMModel


class StaffUserBase(ORMModel):
    email: EmailStr = Field(..., max_length=255)
    role: StaffRole
    name: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    last_login_at: datetime | None = None
    is_active: bool = True


class StaffUserCreate(StaffUserBase):
    school_id: int
    password_hash: str = Field(..., min_length=8)


class StaffUserRead(StaffUserBase):
    id: int
    school_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ORMModel.model_config

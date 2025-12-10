from __future__ import annotations

from pydantic import EmailStr

from app.schemas.base import ORMModel


class DashboardSchoolInfo(ORMModel):
    name: str
    email: EmailStr
    address: str | None = None
    phone: str | None = None


class DashboardOwnerInfo(ORMModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    avatar_url: str | None = None


class DashboardSettingsResponse(ORMModel):
    school: DashboardSchoolInfo
    owner: DashboardOwnerInfo


class DashboardSchoolUpdate(ORMModel):
    name: str
    email: EmailStr
    address: str | None = None
    phone: str | None = None


class DashboardOwnerUpdate(ORMModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    avatar_url: str | None = None

from __future__ import annotations

from datetime import datetime

from app.schemas.base import ORMModel
from app.schemas.quiz_setting import QuizSettingCreate


class DashboardQuizCreateRequest(ORMModel):
    title: str
    description: str | None = None
    template_id: int
    room_id: int
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    is_public: bool = False
    settings: QuizSettingCreate

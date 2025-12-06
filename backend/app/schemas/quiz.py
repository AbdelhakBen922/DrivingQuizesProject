from __future__ import annotations

from datetime import datetime

from app.schemas.base import ORMModel
from app.schemas.quiz_setting import QuizSettingRead


class QuizBase(ORMModel):
	school_id: int | None = None
	setting_id: int | None = None
	is_public: bool = False
	title: str
	description: str | None = None
	total_time_seconds: int | None = None
	created_by_id: int | None = None


class QuizCreate(QuizBase):
	pass


class QuizRead(QuizBase):
	id: int
	created_at: datetime
	updated_at: datetime
	deleted_at: datetime | None = None
	setting: QuizSettingRead | None = None

	model_config = ORMModel.model_config

from __future__ import annotations

from datetime import datetime

from app.schemas.base import ORMModel
from app.schemas.quiz_setting import QuizSettingRead
from app.schemas.quiz_template import QuizTemplateRead


class QuizBase(ORMModel):
	school_id: int | None = None
	setting_id: int | None = None
	template_id: int | None = None
	room_id: int | None = None
	is_public: bool = False
	title: str
	title_ar: str | None = None
	title_fr: str | None = None
	description: str | None = None
	starts_at: datetime | None = None
	ends_at: datetime | None = None
	created_by_id: int | None = None


class QuizCreate(QuizBase):
	pass


class QuizRead(QuizBase):
	id: int
	created_at: datetime
	updated_at: datetime
	deleted_at: datetime | None = None
	setting: QuizSettingRead | None = None
	template: QuizTemplateRead | None = None

	model_config = ORMModel.model_config


class QuizUpdate(ORMModel):
	school_id: int | None = None
	setting_id: int | None = None
	template_id: int | None = None
	room_id: int | None = None
	is_public: bool | None = None
	title: str | None = None
	title_ar: str | None = None
	title_fr: str | None = None
	description: str | None = None
	starts_at: datetime | None = None
	ends_at: datetime | None = None
	created_by_id: int | None = None

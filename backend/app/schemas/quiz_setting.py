from __future__ import annotations

from datetime import datetime

from app.models.enums import QuizMode, VehicleType
from app.schemas.base import ORMModel


class QuizSettingBase(ORMModel):
    vehicle_type: VehicleType = VehicleType.CAR
    mode: QuizMode = QuizMode.TRAINING
    question_count: int = 10
    randomize_questions: bool = True
    randomize_choices: bool = True
    passing_score: int = 70
    review_allowed: bool = False


class QuizSettingCreate(QuizSettingBase):
    pass


class QuizSettingUpdate(ORMModel):
    vehicle_type: VehicleType | None = None
    mode: QuizMode | None = None
    question_count: int | None = None
    randomize_questions: bool | None = None
    randomize_choices: bool | None = None
    passing_score: int | None = None
    review_allowed: bool | None = None

    model_config = ORMModel.model_config


class QuizSettingRead(QuizSettingBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

    model_config = ORMModel.model_config

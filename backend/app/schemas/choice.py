from __future__ import annotations

from pydantic import Field

from app.schemas.base import ORMModel


class ChoiceBase(ORMModel):
    question_id: int
    text: str
    is_correct: bool = False
    position: int = Field(default=0, ge=0)


class ChoiceCreate(ChoiceBase):
    pass


class ChoiceRead(ChoiceBase):
    id: int

    model_config = ORMModel.model_config

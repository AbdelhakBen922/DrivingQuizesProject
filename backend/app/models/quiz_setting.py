from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, Integer, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin
from app.models.enums import QuizMode, VehicleType, enum_values

if TYPE_CHECKING:
    from app.models.quiz import Quiz


class QuizSetting(BigIntPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "quiz_setting"

    vehicle_type: Mapped[VehicleType] = mapped_column(
        Enum(VehicleType, name="quiz_settings_vehicle_type_enum", values_callable=enum_values),
        nullable=False,
        server_default=text(f"'{VehicleType.CAR.value}'"),
    )
    mode: Mapped[QuizMode] = mapped_column(
        Enum(QuizMode, name="quiz_settings_mode_enum", values_callable=enum_values),
        nullable=False,
        server_default=text(f"'{QuizMode.TRAINING.value}'"),
    )
    question_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("10"))
    randomize_questions: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    randomize_choices: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    passing_score: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("70"))
    review_allowed: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))

    quiz: Mapped["Quiz | None"] = relationship(back_populates="setting", uselist=False)

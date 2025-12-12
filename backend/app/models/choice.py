from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Index, Integer, Text, text as sql_text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BigIntPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.answer import Answer
    from app.models.question import Question


class Choice(BigIntPrimaryKeyMixin, Base):
    __tablename__ = "choice"
    __table_args__ = (Index("uq_choice_question_position", "question_id", "position", unique=True),)

    question_id: Mapped[int] = mapped_column(ForeignKey("question.id", ondelete="CASCADE"), nullable=False)
    text_ar: Mapped[str] = mapped_column(Text, nullable=False)
    text_fr: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=sql_text("false"))
    position: Mapped[int] = mapped_column(Integer, nullable=False, server_default=sql_text("0"))

    question: Mapped["Question"] = relationship(back_populates="choices")
    answers: Mapped[list["Answer"]] = relationship(back_populates="choice")

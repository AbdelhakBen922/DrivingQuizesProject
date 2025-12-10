from __future__ import annotations

from app.schemas.base import ORMModel


class RoomQuizAssignRequest(ORMModel):
    quiz_id: int

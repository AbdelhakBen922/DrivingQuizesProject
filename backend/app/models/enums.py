"""Enumerations shared across SQLAlchemy models."""
from __future__ import annotations

from enum import Enum
from typing import Type


def enum_values(enum_cls: Type[Enum]) -> list[str]:
    """Return the string values for an Enum class."""
    return [member.value for member in enum_cls]


class StaffRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    SECRETARY = "secretary"


class QuestionDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class QuizAttemptStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"


class RoomMembershipStatus(str, Enum):
    ACTIVE = "active"
    REMOVED = "removed"


class AuditActorType(str, Enum):
    SCHOOL_STAFF = "school_staff"
    SYSTEM = "system"
    API = "api"


class PlanTier(str, Enum):
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"


class OCRJobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AIAnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class NotificationRecipientType(str, Enum):
    STUDENT = "student"
    STAFF = "staff"
    SYSTEM = "system"

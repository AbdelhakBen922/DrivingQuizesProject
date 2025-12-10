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


class QuestionCategory(str, Enum):
    SIGN = "sign"
    RULE = "rule"
    PRIORITY = "priority"
    SPEED = "speed"
    SAFETY = "safety"
    MECHANICS = "mechanics"


class QuestionType(str, Enum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"


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
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class VehicleType(str, Enum):
    CAR = "car"
    MOTORCYCLE = "motorcycle"
    TRUCK = "truck"
    BUS = "bus"


class QuizMode(str, Enum):
    TRAINING = "training"
    EXAM = "exam"
    PRACTICE = "practice"


class RoomType(str, Enum):
    A = "a"
    B = "b"
    C = "c"
    D = "d"


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

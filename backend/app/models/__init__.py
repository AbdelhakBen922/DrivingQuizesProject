"""Expose SQLAlchemy models for metadata discovery."""
from app.models.base import Base
from app.models.plan import Plan
from app.models.school import School
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.models.question_bank_question import QuestionBankQuestion
from app.models.quiz_template import QuizTemplate
from app.models.quiz_template_question import QuizTemplateQuestion
from app.models.room import Room
from app.models.room_quiz_instance import RoomQuizInstance
from app.models.student_room_membership import StudentRoomMembership
from app.models.quiz_attempt import QuizAttempt
from app.models.question_attempt import QuestionAttempt
from app.models.audit_log import AuditLog
from app.models.file_storage_record import FileStorageRecord
from app.models.ocr_job import OCRJob
from app.models.ai_analysis_job import AIAnalysisJob
from app.models.notification import Notification
from app.models.system_settings import SystemSettings

__all__ = [
    "Base",
    "Plan",
    "School",
    "StaffUser",
    "Student",
    "QuestionBankQuestion",
    "QuizTemplate",
    "QuizTemplateQuestion",
    "Room",
    "RoomQuizInstance",
    "StudentRoomMembership",
    "QuizAttempt",
    "QuestionAttempt",
    "AuditLog",
    "FileStorageRecord",
    "OCRJob",
    "AIAnalysisJob",
    "Notification",
    "SystemSettings",
]

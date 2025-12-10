"""Aggregate SQLAlchemy models for metadata discovery."""
from app.models.answer import Answer
from app.models.base import Base
from app.models.choice import Choice
from app.models.learning_module import LearningModule
from app.models.learning_module_lesson import LearningModuleLesson
from app.models.learning_progress import LearningProgress
from app.models.plan import Plan
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.quiz_template import QuizTemplate
from app.models.quiz_template_question import QuizTemplateQuestion
from app.models.quiz_setting import QuizSetting
from app.models.room import Room
from app.models.room_member import RoomMember
from app.models.room_quiz import RoomQuiz
from app.models.school import School
from app.models.staff_user import StaffUser
from app.models.student import Student

__all__ = [
    "Answer",
    "Base",
    "Choice",
    "LearningModule",
    "LearningModuleLesson",
    "LearningProgress",
    "Plan",
    "Question",
    "Quiz",
    "QuizAttempt",
    "QuizTemplate",
    "QuizTemplateQuestion",
    "QuizSetting",
    "Room",
    "RoomMember",
    "RoomQuiz",
    "School",
    "StaffUser",
    "Student",
]

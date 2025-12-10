from __future__ import annotations

import asyncio
import sys
from datetime import timedelta
from decimal import Decimal
from pathlib import Path

from sqlalchemy import select

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from app.core.database import AsyncSessionLocal
from app.models.answer import Answer
from app.models.choice import Choice
from app.models.learning_module import LearningModule
from app.models.learning_module_lesson import LearningModuleLesson
from app.models.learning_progress import LearningProgress
from app.models.plan import Plan
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.quiz_setting import QuizSetting
from app.models.quiz_template import QuizTemplate
from app.models.quiz_template_question import QuizTemplateQuestion
from app.models.room import Room
from app.models.room_member import RoomMember
from app.models.room_quiz import RoomQuiz
from app.models.school import School
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.models.enums import (
    PlanTier,
    QuestionCategory,
    QuestionDifficulty,
    QuestionType,
    QuizMode,
    RoomMembershipStatus,
    RoomQuizStatus,
    RoomType,
    StaffRole,
    VehicleType,
)


async def get_or_create(session, model, lookup: dict, defaults: dict):
    stmt = select(model).filter_by(**lookup)
    result = await session.execute(stmt)
    instance = result.scalars().first()
    created = False
    if instance:
        for key, value in defaults.items():
            setattr(instance, key, value)
    else:
        data = {**lookup, **defaults}
        instance = model(**data)
        session.add(instance)
        await session.flush()
        created = True
    return instance, created


async def sync_choices(session, question_id: int, options: list[dict]) -> None:
    existing_stmt = await session.execute(select(Choice).where(Choice.question_id == question_id))
    existing = {choice.position: choice for choice in existing_stmt.scalars()}
    seen_positions: set[int] = set()

    for option in options:
        position = option["position"]
        seen_positions.add(position)
        lookup = {"question_id": question_id, "position": position}
        defaults = {"text": option["text"], "is_correct": option["is_correct"]}
        choice, _ = await get_or_create(session, Choice, lookup, defaults)
        # ensure updates when record already existed
        choice.text = option["text"]
        choice.is_correct = option["is_correct"]

    for position, choice in existing.items():
        if position not in seen_positions:
            await session.delete(choice)


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        report: list[str] = []

        plan_defaults = {
            "description": "Professional tier for medium schools",
            "price_monthly": Decimal("49.00"),
            "max_students": 500,
            "max_staff_users": 25,
            "max_rooms": 50,
            "max_questions_per_quiz": 40,
            "features": {"analytics": True, "priority_support": True},
            "is_active": True,
        }
        plan, created = await get_or_create(
            session,
            Plan,
            {"name": PlanTier.PROFESSIONAL.value},
            plan_defaults,
        )
        report.append(f"Plan: {'created' if created else 'updated'}")

        school_defaults = {
            "name": "Atlas Driving Academy",
            "legal_name": "Atlas Mobility Services",
            "registration_number": "DRV-001",
            "email": "contact@atlas-driving.com",
            "password": "not-a-real-hash",
            "timezone": "Africa/Algiers",
            "locale": "fr-DZ",
            "address": "Si Di Abdellah, Algiers",
            "phone": "+213667341234",
            "language_defaults": {"primary": "fr", "fallback": "en"},
            "plan_id": plan.id,
            "billing_info": {"vat_number": "DZ123456789"},
            "settings": {"default_passing_score": 32},
        }
        school, created = await get_or_create(
            session,
            School,
            {"registration_number": school_defaults["registration_number"]},
            school_defaults,
        )
        report.append(f"School: {'created' if created else 'updated'}")

        staff_defaults = {
            "school_id": school.id,
            "email": "owner@atlas-driving.com",
            "password_hash": "pbkdf2:demo-hash",
            "role": StaffRole.OWNER,
            "name": "Leila Ait",
            "phone": "+213555010101",
            "is_active": True,
        }
        staff, created = await get_or_create(
            session,
            StaffUser,
            {"email": staff_defaults["email"]},
            staff_defaults,
        )
        report.append(f"Staff user: {'created' if created else 'updated'}")

        student_defaults = {
            "school_id": school.id,
            "full_name": "Karim Bensaid",
            "student_code": "STU-001",
            "password_hash": "pbkdf2:demo-student",
            "phone": "+213555020202",
            "email": "karim@example.com",
            "profile_data": {"notes": "Prefers evening sessions"},
            "created_by_id": staff.id,
        }
        student, created = await get_or_create(
            session,
            Student,
            {
                "school_id": school.id,
                "student_code": student_defaults["student_code"],
            },
            student_defaults,
        )
        report.append(f"Student: {'created' if created else 'updated'}")

        question_defaults = {
            "school_id": school.id,
            "author_id": staff.id,
            "text": "What does a flashing amber traffic light indicate at an intersection?",
            "category": QuestionCategory.PRIORITY,
            "difficulty": QuestionDifficulty.MEDIUM,
            "type": QuestionType.SINGLE_CHOICE,
            "explanation": "Slow down and proceed only when it is safe to do so.",
            "tags": {"topic": "priority_rules"},
        }
        question, created = await get_or_create(
            session,
            Question,
            {"text": question_defaults["text"]},
            question_defaults,
        )
        report.append(f"Question: {'created' if created else 'updated'}")

        options = [
            {"position": 1, "text": "You must stop completely", "is_correct": False},
            {"position": 2, "text": "Proceed with caution, giving priority", "is_correct": True},
            {"position": 3, "text": "Speed up to clear the intersection", "is_correct": False},
            {"position": 4, "text": "Turn off your headlights", "is_correct": False},
        ]
        await sync_choices(session, question.id, options)

        choice_stmt = await session.execute(
            select(Choice).where(Choice.question_id == question.id).order_by(Choice.position)
        )
        choices = choice_stmt.scalars().all()
        correct_choice = next(choice for choice in choices if choice.is_correct)

        template_defaults = {
            "school_id": school.id,
            "title": "Priority Rules Fundamentals",
            "description": "Template focusing on intersection priority decisions",
            "difficulty": QuestionDifficulty.MEDIUM,
            "default_duration_sec": 600,
            "settings": {"question_count": 10, "passing_score": 8},
            "is_public": False,
            "created_by_id": staff.id,
        }
        template, created = await get_or_create(
            session,
            QuizTemplate,
            {"title": template_defaults["title"], "school_id": school.id},
            template_defaults,
        )
        report.append(f"Quiz template: {'created' if created else 'updated'}")

        template_question_defaults = {
            "position": 1,
            "duration_sec": 45,
            "is_required": True,
            "randomize_options": True,
            "estimation_time_seconds": 45,
        }
        _, created = await get_or_create(
            session,
            QuizTemplateQuestion,
            {"template_id": template.id, "question_id": question.id},
            template_question_defaults,
        )
        report.append(f"Template question link: {'created' if created else 'updated'}")

        setting_defaults = {
            "vehicle_type": VehicleType.CAR,
            "mode": QuizMode.TRAINING,
            "question_count": 10,
            "randomize_questions": True,
            "randomize_choices": True,
            "passing_score": 8,
            "review_allowed": True,
        }
        quiz_setting, created = await get_or_create(
            session,
            QuizSetting,
            {"vehicle_type": setting_defaults["vehicle_type"], "mode": setting_defaults["mode"]},
            setting_defaults,
        )
        report.append(f"Quiz setting: {'created' if created else 'updated'}")

        quiz_defaults = {
            "school_id": school.id,
            "setting_id": quiz_setting.id,
            "template_id": template.id,
            "title": "Fundamentals Assessment",
            "description": "Covers basic priority and safety rules",
            "created_by_id": staff.id,
        }
        quiz, created = await get_or_create(
            session,
            Quiz,
            {"title": quiz_defaults["title"]},
            quiz_defaults,
        )
        report.append(f"Quiz: {'created' if created else 'updated'}")

        module_defaults = {
            "school_id": school.id,
            "created_by_id": staff.id,
            "title": "Traffic Theory Essentials",
            "description": "Sequenced lessons that reinforce the quiz material",
            "content": {"estimated_time_minutes": 90, "objectives": ["Understand right-of-way", "Master safe maneuvers"]},
            "tags": {"level": "beginner"},
        }
        learning_module, created = await get_or_create(
            session,
            LearningModule,
            {"title": module_defaults["title"], "school_id": school.id},
            module_defaults,
        )
        report.append(f"Learning module: {'created' if created else 'updated'}")

        lessons_payload = [
            {
                "order_index": 1,
                "title": "Right-of-Way Basics",
                "content": {
                    "summary": "When to yield at intersections",
                    "media": {"type": "video", "url": "https://example.com/right-of-way"},
                },
            },
            {
                "order_index": 2,
                "title": "Safe Turning Techniques",
                "content": {
                    "summary": "Mirror-signal-maneuver routine",
                    "media": {"type": "diagram", "url": "https://example.com/turning"},
                },
            },
        ]

        lessons: list[LearningModuleLesson] = []
        for lesson_data in lessons_payload:
            lookup = {
                "learning_module_id": learning_module.id,
                "order_index": lesson_data["order_index"],
            }
            defaults = {
                "title": lesson_data["title"],
                "content": lesson_data["content"],
            }
            lesson, lesson_created = await get_or_create(
                session,
                LearningModuleLesson,
                lookup,
                defaults,
            )
            lessons.append(lesson)
            report.append(
                "Lesson order {order}: {state}".format(
                    order=lesson_data["order_index"],
                    state="created" if lesson_created else "updated",
                )
            )

        first_lesson_id = lessons[0].id if lessons else None
        progress_defaults = {
            "lesson_id": first_lesson_id,
            "completed": False,
            "progress_data": {"percent_complete": 0.25, "last_activity": "seed"},
        }
        _, created = await get_or_create(
            session,
            LearningProgress,
            {"student_id": student.id, "learning_module_id": learning_module.id},
            progress_defaults,
        )
        report.append(f"Learning progress: {'created' if created else 'updated'}")

        room_defaults = {
            "school_id": school.id,
            "name": "Morning Cohort",
            "description": "Weekday training group",
            "room_type": RoomType.B,
            "created_by_id": staff.id,
        }
        room, created = await get_or_create(
            session,
            Room,
            {"school_id": school.id, "name": room_defaults["name"]},
            room_defaults,
        )
        report.append(f"Room: {'created' if created else 'updated'}")

        room_member_defaults = {
            "status": RoomMembershipStatus.ACTIVE,
        }
        room_member, created = await get_or_create(
            session,
            RoomMember,
            {"room_id": room.id, "student_id": student.id},
            room_member_defaults,
        )
        report.append(f"Room member: {'created' if created else 'updated'}")

        room_quiz_defaults = {
            "instance_settings": {"available_attempts": 2},
            "status": RoomQuizStatus.ACTIVE,
        }
        _, created = await get_or_create(
            session,
            RoomQuiz,
            {"room_id": room.id, "quiz_id": quiz.id},
            room_quiz_defaults,
        )
        report.append(f"Room quiz: {'created' if created else 'updated'}")

        quiz_attempt_defaults = {
            "time_spent_sec": 120,
            "score": 10,
            "extra_metadata": {"submitted_via": "seed"},
        }
        quiz_attempt, created = await get_or_create(
            session,
            QuizAttempt,
            {"quiz_id": quiz.id, "room_member_id": room_member.id, "attempt_number": 1},
            quiz_attempt_defaults,
        )
        report.append(f"Quiz attempt: {'created' if created else 'updated'}")

        answer_defaults = {
            "choice_id": correct_choice.id,
            "is_correct": True,
        }
        _, created = await get_or_create(
            session,
            Answer,
            {"attempt_id": quiz_attempt.id, "question_id": question.id},
            answer_defaults,
        )
        report.append(f"Answer: {'created' if created else 'updated'}")

        await session.commit()
        for line in report:
            print(line)


if __name__ == "__main__":
    asyncio.run(seed())

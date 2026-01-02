from __future__ import annotations

import os
import sys
from datetime import timedelta
from decimal import Decimal
from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker, Session

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

# Create sync engine for seeding (psycopg2 works perfectly with Leapcell)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/drivingquiz")
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
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
    RoomType,
    StaffRole,
    VehicleType,
)


def get_or_create(session, model, lookup: dict, defaults: dict):
    stmt = select(model).filter_by(**lookup)
    result = session.execute(stmt)
    instance = result.scalars().first()
    created = False
    if instance:
        for key, value in defaults.items():
            setattr(instance, key, value)
    else:
        data = {**lookup, **defaults}
        instance = model(**data)
        session.add(instance)
        session.flush()
        created = True
    return instance, created


def sync_choices(session, question_id: int, options: list[dict]) -> None:
    existing_stmt = session.execute(select(Choice).where(Choice.question_id == question_id))
    existing = {choice.position: choice for choice in existing_stmt.scalars()}
    seen_positions: set[int] = set()

    for option in options:
        position = option["position"]
        seen_positions.add(position)
        lookup = {"question_id": question_id, "position": position}
        defaults = {
            "text_ar": option["text_ar"],
            "text_fr": option["text_fr"],
            "is_correct": option["is_correct"],
        }
        choice, _ = get_or_create(session, Choice, lookup, defaults)
        # ensure updates when record already existed
        choice.text_ar = option["text_ar"]
        choice.text_fr = option["text_fr"]
        choice.is_correct = option["is_correct"]

    for position, choice in existing.items():
        if position not in seen_positions:
            session.delete(choice)


def seed() -> None:
    with SessionLocal() as session:
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
        plan, created = get_or_create(
            session,
            Plan,
            {"name": PlanTier.PROFESSIONAL.value},
            plan_defaults,
        )
        report.append(f"Plan: {'created' if created else 'updated'}")

        school_defaults = {
            "plan_id": plan.id,
            "name": "Atlas Driving Academy",
            "legal_name": "Atlas Mobility Services",
            "registration_number": "DRV-001",
            "email": "contact@atlas-driving.com",
            "password": "not-a-real-hash",
            "timezone": "Africa/Algiers",
            "locale": "fr-DZ",
            "address": "18 Rue Didouche Mourad, Algiers",
            "phone": "+213555000000",
            "language_defaults": {"primary": "fr", "secondary": "ar"},
            "billing_info": {"tax_id": "AL-DRV-001", "contact": "Finance"},
            "settings": {"default_vehicle_type": "car"},
        }
        school, created = get_or_create(
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
            "first_name": "Leila",
            "last_name": "Ait",
            "name": "Leila Ait",
            "avatar_url": "https://example.com/assets/leila.png",
            "phone": "+213555010101",
            "is_active": True,
        }
        staff, created = get_or_create(
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
        student, created = get_or_create(
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
            "text_ar": "ماذا يعني ضوء المرور الكهرماني الوامض عند التقاطع؟",
            "text_fr": "Que signifie un feu orange clignotant à une intersection ?",
            "category": QuestionCategory.PRIORITY,
            "difficulty": QuestionDifficulty.MEDIUM,
            "type": QuestionType.SINGLE_CHOICE,
            "explanation": "Slow down and proceed only when it is safe to do so.",
            "tags": {"topic": "priority_rules"},
        }
        question, created = get_or_create(
            session,
            Question,
            {"text_fr": question_defaults["text_fr"]},
            question_defaults,
        )
        report.append(f"Question: {'created' if created else 'updated'}")

        options = [
            {
                "position": 1,
                "text_ar": "يجب أن تتوقف تمامًا",
                "text_fr": "Vous devez vous arrêter complètement",
                "is_correct": False,
            },
            {
                "position": 2,
                "text_ar": "تابع بحذر مع إعطاء الأولوية",
                "text_fr": "Avancez prudemment en donnant la priorité",
                "is_correct": True,
            },
            {
                "position": 3,
                "text_ar": "زد سرعتك لعبور التقاطع",
                "text_fr": "Accélérez pour dégager l'intersection",
                "is_correct": False,
            },
            {
                "position": 4,
                "text_ar": "أطفئ أضواءك الأمامية",
                "text_fr": "Éteignez vos phares",
                "is_correct": False,
            },
        ]
        sync_choices(session, question.id, options)

        choice_stmt = session.execute(
            select(Choice).where(Choice.question_id == question.id).order_by(Choice.position)
        )
        choices = choice_stmt.scalars().all()
        correct_choice = next(choice for choice in choices if choice.is_correct)

        template_defaults = {
            "school_id": school.id,
            "title": "Priority Rules Fundamentals",
            "title_ar": "أساسيات قواعد الأولوية",
            "title_fr": "Fondamentaux des règles de priorité",
            "description": "Template focusing on intersection priority decisions",
            "description_ar": "قالب يركز على قرارات الأولوية عند التقاطعات",
            "description_fr": "Modèle axé sur les décisions de priorité aux intersections",
            "difficulty": QuestionDifficulty.MEDIUM,
            "default_duration_sec": 600,
            "settings": {"question_count": 10, "passing_score": 8},
            "is_public": False,
            "created_by_id": staff.id,
        }
        template, created = get_or_create(
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
        _, created = get_or_create(
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
        quiz_setting, created = get_or_create(
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
            "title_ar": "تقييم الأساسيات",
            "title_fr": "Évaluation des fondamentaux",
            "description": "Covers basic priority and safety rules",
            "created_by_id": staff.id,
        }
        quiz, created = get_or_create(
            session,
            Quiz,
            {"title_fr": quiz_defaults["title_fr"]},
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
        learning_module, created = get_or_create(
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
            lesson, lesson_created = get_or_create(
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
        _, created = get_or_create(
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
        room, created = get_or_create(
            session,
            Room,
            {"school_id": school.id, "name": room_defaults["name"]},
            room_defaults,
        )
        report.append(f"Room: {'created' if created else 'updated'}")

        room_member_defaults = {
            "status": RoomMembershipStatus.ACTIVE,
        }
        room_member, created = get_or_create(
            session,
            RoomMember,
            {"room_id": room.id, "student_id": student.id},
            room_member_defaults,
        )
        report.append(f"Room member: {'created' if created else 'updated'}")

        if quiz.room_id != room.id:
            quiz.room_id = room.id
            session.flush()
            report.append("Quiz assigned to room")

        quiz_attempt_defaults = {
            "time_spent_sec": 120,
            "score": 10,
            "extra_metadata": {"submitted_via": "seed"},
        }
        quiz_attempt, created = get_or_create(
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
        _, created = get_or_create(
            session,
            Answer,
            {"attempt_id": quiz_attempt.id, "question_id": question.id},
            answer_defaults,
        )
        report.append(f"Answer: {'created' if created else 'updated'}")

        session.commit()
        for line in report:
            print(line)


if __name__ == "__main__":
    seed()

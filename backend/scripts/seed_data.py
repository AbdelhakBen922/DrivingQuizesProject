from __future__ import annotations

import asyncio
import uuid
from datetime import timedelta, timezone

from faker import Faker
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.plan import Plan
from app.models.question_bank_question import QuestionBankQuestion
from app.models.quiz_template import QuizTemplate
from app.models.quiz_template_question import QuizTemplateQuestion
from app.models.room import Room
from app.models.room_quiz_instance import RoomQuizInstance
from app.models.school import School
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.models.student_room_membership import StudentRoomMembership
from app.models.enums import (
    PlanTier,
    QuestionDifficulty,
    RoomMembershipStatus,
    StaffRole,
)

faker = Faker()

PLAN_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
SCHOOL_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")
STAFF_ID = uuid.UUID("33333333-3333-3333-3333-333333333333")
QUESTION_ID = uuid.UUID("44444444-4444-4444-4444-444444444444")
TEMPLATE_ID = uuid.UUID("55555555-5555-5555-5555-555555555555")
TEMPLATE_QUESTION_ID = uuid.UUID("66666666-6666-6666-6666-666666666666")
ROOM_ID = uuid.UUID("77777777-7777-7777-7777-777777777777")
ROOM_QUIZ_ID = uuid.UUID("88888888-8888-8888-8888-888888888888")
STUDENT_ID = uuid.UUID("99999999-9999-9999-9999-999999999999")
MEMBERSHIP_ID = uuid.UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")


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


async def seed():
    async with AsyncSessionLocal() as session:
        faker.seed_instance(2024)
        faker.unique.clear()
        report: list[str] = []

        plan_defaults = {
            "name": PlanTier.BASIC,
            "description": f"{faker.catch_phrase()} plan",
            "monthly_price_cents": faker.random_int(min=2000, max=5000),
            "features": {
                "max_students": faker.random_int(min=100, max=500),
                "support": faker.random_element(elements=["email", "chat", "phone"]),
            },
            "limits": {
                "rooms_per_school": faker.random_int(min=3, max=10),
                "questions_per_template": faker.random_int(min=40, max=120),
            },
        }

        plan, created = await get_or_create(
            session,
            Plan,
            {"id": PLAN_ID},
            plan_defaults,
        )
        report.append(f"Plan: {'created' if created else 'updated'}")

        school_defaults = {
            "name": f"{faker.city()} Driving School",
            "legal_name": f"{faker.company()} Training",
            "registration_number": faker.bothify(text="??-######").upper(),
            "address": faker.address().replace("\n", " "),
            "phone": faker.phone_number(),
            "email": faker.company_email(),
            "timezone": faker.random_element(
                elements=["Africa/Algiers", "Europe/Paris", "UTC"]
            ),
            "locale": "fr-DZ",
            "language_defaults": faker.random_element(elements=["fr", "en", "ar"]),
            "plan_id": plan.id,
            "billing_info": {
                "vat_number": faker.bothify(text="??########").upper(),
                "billing_contact": faker.name(),
            },
            "settings": {"default_room_duration": faker.random_int(min=60, max=120)},
        }

        school, created = await get_or_create(
            session,
            School,
            {"id": SCHOOL_ID},
            school_defaults,
        )
        report.append(f"School: {'created' if created else 'updated'}")

        staff_defaults = {
            "school_id": school.id,
            "email": faker.unique.company_email(),
            "password_hash": "not-a-real-hash",
            "role": faker.random_element(
                elements=[StaffRole.ADMIN, StaffRole.INSTRUCTOR, StaffRole.SECRETARY]
            ),
            "name": faker.name(),
            "phone": faker.phone_number(),
            "is_active": True,
        }

        staff, created = await get_or_create(
            session,
            StaffUser,
            {"id": STAFF_ID},
            staff_defaults,
        )
        report.append(f"Staff user: {'created' if created else 'updated'}")

        option_labels = ["A", "B", "C", "D"]
        option_texts = faker.sentences(nb=len(option_labels))
        options = [
            {"id": label, "text": text}
            for label, text in zip(option_labels, option_texts)
        ]
        correct_option_id = faker.random_element(elements=[opt["id"] for opt in options])

        question_defaults = {
            "school_id": school.id,
            "author_id": staff.id,
            "category": faker.random_element(
                elements=["traffic_signs", "safety", "regulations", "etiquette"]
            ),
            "difficulty": faker.random_element(
                elements=[
                    QuestionDifficulty.EASY,
                    QuestionDifficulty.MEDIUM,
                    QuestionDifficulty.HARD,
                ]
            ),
            "question_text": f"{faker.sentence(nb_words=10).rstrip('.')}?",
            "options": options,
            "correct_option_ids": [correct_option_id],
            "is_multiple_choice": False,
            "score": faker.random_int(min=1, max=10),
            "explanation": faker.sentence(nb_words=12),
            "tags": faker.words(nb=3),
            "version": 1,
        }

        question, created = await get_or_create(
            session,
            QuestionBankQuestion,
            {"id": QUESTION_ID},
            question_defaults,
        )
        report.append(f"Question: {'created' if created else 'updated'}")

        template_defaults = {
            "school_id": school.id,
            "title": f"{faker.word().capitalize()} Theory Exam",
            "description": faker.sentence(nb_words=12),
            "total_time_seconds": faker.random_int(min=1200, max=3600),
            "settings": {
                "passing_score": faker.random_int(min=60, max=90),
                "shuffle_questions": True,
            },
            "visibility": faker.random_element(elements=["private", "internal"]),
            "created_by_id": staff.id,
        }

        template, created = await get_or_create(
            session,
            QuizTemplate,
            {"id": TEMPLATE_ID},
            template_defaults,
        )
        report.append(f"Quiz template: {'created' if created else 'updated'}")

        template_question_defaults = {
            "quiz_template_id": template.id,
            "question_id": question.id,
            "question_order": 1,
            "override_score": question_defaults["score"],
            "is_required": True,
            "randomize_options": True,
            "estimation_time_seconds": faker.random_int(min=30, max=90),
        }

        template_question, created = await get_or_create(
            session,
            QuizTemplateQuestion,
            {"id": TEMPLATE_QUESTION_ID},
            template_question_defaults,
        )
        report.append(f"Template question: {'created' if created else 'updated'}")

        room_start = faker.future_datetime(end_date="+30d", tzinfo=timezone.utc)
        room_end = room_start + timedelta(hours=2)

        room_defaults = {
            "school_id": school.id,
            "name": f"{faker.color_name()} Cohort",
            "code": faker.bothify(text="DRV-###").upper(),
            "start_at": room_start,
            "end_at": room_end,
            "is_active": True,
            "settings": {"max_attempts": faker.random_int(min=1, max=3)},
            "created_by_id": staff.id,
        }

        room, created = await get_or_create(
            session,
            Room,
            {"id": ROOM_ID},
            room_defaults,
        )
        report.append(f"Room: {'created' if created else 'updated'}")

        room_quiz_defaults = {
            "room_id": room.id,
            "quiz_template_id": template.id,
            "instance_settings": {
                "time_multiplier": faker.random_element(elements=[0.75, 1.0, 1.25])
            },
            "assigned_at": room_start - timedelta(minutes=15),
            "due_at": room_end,
            "created_by_id": staff.id,
        }

        room_quiz, created = await get_or_create(
            session,
            RoomQuizInstance,
            {"id": ROOM_QUIZ_ID},
            room_quiz_defaults,
        )
        report.append(f"Room quiz instance: {'created' if created else 'updated'}")

        student_defaults = {
            "school_id": school.id,
            "full_name": faker.name(),
            "dob": faker.date_of_birth(minimum_age=18, maximum_age=40),
            "student_code": faker.unique.bothify(text="STU-###"),
            "phone": faker.phone_number(),
            "email": faker.unique.email(),
            "profile_data": {"note": faker.sentence(nb_words=8)},
            "created_by_id": staff.id,
        }

        student, created = await get_or_create(
            session,
            Student,
            {"id": STUDENT_ID},
            student_defaults,
        )
        report.append(f"Student: {'created' if created else 'updated'}")

        membership_defaults = {
            "student_id": student.id,
            "room_id": room.id,
            "joined_at": room_start,
            "status": RoomMembershipStatus.ACTIVE,
        }

        membership, created = await get_or_create(
            session,
            StudentRoomMembership,
            {"id": MEMBERSHIP_ID},
            membership_defaults,
        )
        report.append(f"Room membership: {'created' if created else 'updated'}")

        await session.commit()
        for line in report:
            print(line)


if __name__ == "__main__":
    asyncio.run(seed())

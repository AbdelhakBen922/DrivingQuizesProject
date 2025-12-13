"""Utility script to create a default staff and student account."""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from sqlalchemy import select

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from app.core.database import AsyncSessionLocal  # noqa: E402
from app.core.security import get_password_hash  # noqa: E402
from app.models.enums import StaffRole  # noqa: E402
from app.models.room import Room  # noqa: E402
from app.models.school import School  # noqa: E402
from app.models.staff_user import StaffUser  # noqa: E402
from app.models.student import Student  # noqa: E402


async def create_default_users() -> None:
    async with AsyncSessionLocal() as session:
        school = (await session.execute(select(School).where(School.id == 1))).scalars().first()

        created_any = False

        if not school:
            school = School(
                id=1,
                name="Default Driving School",
                legal_name="Default Driving School",
                registration_number="SCH-001",
                email="school@example.com",
                password=get_password_hash("school123"),
                timezone="UTC",
                locale="fr",
            )
            session.add(school)
            await session.flush()
            created_any = True

        school_id = school.id

        staff_exists = await session.execute(select(StaffUser).where(StaffUser.email == "admin@example.com"))
        student_exists = await session.execute(
            select(Student).where(Student.student_code == "S1001", Student.school_id == school_id)
        )

        if not staff_exists.scalars().first():
            staff = StaffUser(
                email="admin@example.com",
                password_hash=get_password_hash("admin123"),
                school_id=school_id,
                role=StaffRole.OWNER,
                is_active=True,
                first_name="Admin",
                last_name="User",
                name="Admin User",
                avatar_url=None,
            )
            session.add(staff)
            created_any = True

        if not student_exists.scalars().first():
            student = Student(
                school_id=school_id,
                full_name="Sample Student",
                student_code="S1001",
                password_hash=get_password_hash("student123"),
            )
            session.add(student)
            created_any = True

        room_exists = await session.execute(select(Room).where(Room.school_id == school_id))
        if not room_exists.scalars().first():
            room = Room(
                school_id=school_id,
                name="Default Room",
                description="Default room for testing",
            )
            session.add(room)
            created_any = True

        if created_any:
            await session.commit()
            print("Default school, staff, student, and room created successfully.")
        else:
            print("Default staff and student already exist.")


if __name__ == "__main__":
    asyncio.run(create_default_users())

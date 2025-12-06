"""Utility script to create a default staff and student account."""
from __future__ import annotations

import sys
from pathlib import Path

from sqlalchemy.orm import sessionmaker

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from app.core.database import engine  # noqa: E402
from app.core.security import get_password_hash  # noqa: E402
from app.models.enums import StaffRole  # noqa: E402
from app.models.staff_user import StaffUser  # noqa: E402
from app.models.student import Student  # noqa: E402

SessionLocal = sessionmaker(bind=engine.sync_engine, autoflush=False, autocommit=False)


def create_default_users() -> None:
    session = SessionLocal()
    try:
        staff = StaffUser(
            email="admin@example.com",
            password_hash=get_password_hash("admin123"),
            school_id=1,
            role=StaffRole.OWNER,
            is_active=True,
            name="Administrator",
        )
        student = Student(
            school_id=1,
            full_name="Sample Student",
            student_code="S1001",
            password_hash=get_password_hash("student123"),
        )

        session.add(staff)
        session.add(student)
        session.commit()
    finally:
        session.close()


if __name__ == "__main__":
    create_default_users()

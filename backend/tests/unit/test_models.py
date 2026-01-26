"""Unit tests for database models."""
from __future__ import annotations

import pytest
from datetime import date

from app.models.enums import StaffRole
from app.models.school import School
from app.models.staff_user import StaffUser
from app.models.student import Student


class TestStaffRoleEnum:
    """Tests for StaffRole enum."""

    def test_staff_role_values(self):
        """Test that all expected roles exist."""
        assert StaffRole.OWNER is not None
        assert StaffRole.ADMIN is not None
        assert StaffRole.INSTRUCTOR is not None
        assert StaffRole.SECRETARY is not None

    def test_staff_role_value_strings(self):
        """Test role value strings."""
        assert StaffRole.OWNER.value == "owner"
        assert StaffRole.ADMIN.value == "admin"
        assert StaffRole.INSTRUCTOR.value == "instructor"
        assert StaffRole.SECRETARY.value == "secretary"


class TestSchoolModel:
    """Tests for School model."""

    def test_school_creation(self):
        """Test creating a School instance."""
        school = School(
            name="Test Driving School",
            email="school@test.com",
            password="testpassword",
        )
        
        assert school.name == "Test Driving School"
        assert school.email == "school@test.com"

    def test_school_tablename(self):
        """Test School table name."""
        assert School.__tablename__ == "school"

    def test_school_optional_fields(self):
        """Test School with optional fields."""
        school = School(
            name="Test School",
            email="test@school.com",
            password="pass123",
            legal_name="Test School Inc.",
            phone="+1234567890",
            address="123 Test Street",
        )
        
        assert school.legal_name == "Test School Inc."
        assert school.phone == "+1234567890"
        assert school.address == "123 Test Street"


class TestStaffUserModel:
    """Tests for StaffUser model."""

    def test_staff_user_creation(self):
        """Test creating a StaffUser instance."""
        staff = StaffUser(
            school_id=1,
            email="admin@test.com",
            password_hash="hashed_password",
            role=StaffRole.ADMIN,
            first_name="John",
            last_name="Doe",
            is_active=True,
        )
        
        assert staff.email == "admin@test.com"
        assert staff.role == StaffRole.ADMIN
        assert staff.first_name == "John"
        assert staff.last_name == "Doe"
        assert staff.is_active is True

    def test_staff_user_tablename(self):
        """Test StaffUser table name."""
        assert StaffUser.__tablename__ == "staff_user"

    def test_staff_user_optional_fields(self):
        """Test StaffUser with optional fields."""
        staff = StaffUser(
            school_id=1,
            email="admin@test.com",
            password_hash="hashed_password",
            role=StaffRole.INSTRUCTOR,
        )
        
        assert staff.first_name is None
        assert staff.last_name is None
        assert staff.phone is None
        assert staff.avatar_url is None
        assert staff.last_login_at is None


class TestStudentModel:
    """Tests for Student model."""

    def test_student_creation(self):
        """Test creating a Student instance."""
        student = Student(
            school_id=1,
            full_name="Jane Doe",
            student_code="STU001",
            password_hash="hashed_password",
            email="jane@test.com",
            phone="+1234567890",
        )
        
        assert student.full_name == "Jane Doe"
        assert student.student_code == "STU001"
        assert student.email == "jane@test.com"
        assert student.phone == "+1234567890"

    def test_student_tablename(self):
        """Test Student table name."""
        assert Student.__tablename__ == "student"

    def test_student_optional_fields(self):
        """Test Student with optional fields."""
        student = Student(
            school_id=1,
            full_name="Jane Doe",
            student_code="STU002",
            password_hash="hashed_password",
        )
        
        assert student.email is None
        assert student.phone is None
        assert student.dob is None
        assert student.national_id is None
        assert student.created_by_id is None

    def test_student_with_dob(self):
        """Test Student with date of birth."""
        dob = date(1995, 5, 15)
        student = Student(
            school_id=1,
            full_name="Jane Doe",
            student_code="STU003",
            password_hash="hashed_password",
            dob=dob,
        )
        
        assert student.dob == dob
        assert student.dob.year == 1995
        assert student.dob.month == 5
        assert student.dob.day == 15

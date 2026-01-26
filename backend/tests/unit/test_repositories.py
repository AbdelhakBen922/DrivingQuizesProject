"""Unit tests for repository layer."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.staff_user import StaffUser
from app.models.student import Student
from app.repositories import staff as staff_repo
from app.repositories import student as student_repo


class TestStaffRepository:
    """Tests for staff repository functions."""

    @pytest.mark.asyncio
    async def test_get_staff_by_email_found(self):
        """Test getting staff by email when staff exists."""
        mock_staff = MagicMock(spec=StaffUser)
        mock_staff.email = "admin@test.com"
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = mock_staff
        
        mock_session = AsyncMock()
        mock_session.execute.return_value = mock_result
        
        result = await staff_repo.get_staff_by_email(mock_session, "admin@test.com")
        
        assert result == mock_staff
        mock_session.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_staff_by_email_not_found(self):
        """Test getting staff by email when staff doesn't exist."""
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = None
        
        mock_session = AsyncMock()
        mock_session.execute.return_value = mock_result
        
        result = await staff_repo.get_staff_by_email(mock_session, "nonexistent@test.com")
        
        assert result is None

    @pytest.mark.asyncio
    async def test_get_staff_by_id_found(self):
        """Test getting staff by ID when staff exists."""
        mock_staff = MagicMock(spec=StaffUser)
        mock_staff.id = 1
        
        mock_session = AsyncMock()
        mock_session.get.return_value = mock_staff
        
        result = await staff_repo.get_staff_by_id(mock_session, 1)
        
        assert result == mock_staff
        mock_session.get.assert_called_once_with(StaffUser, 1)

    @pytest.mark.asyncio
    async def test_get_staff_by_id_not_found(self):
        """Test getting staff by ID when staff doesn't exist."""
        mock_session = AsyncMock()
        mock_session.get.return_value = None
        
        result = await staff_repo.get_staff_by_id(mock_session, 999)
        
        assert result is None

    @pytest.mark.asyncio
    async def test_create_staff(self):
        """Test creating a new staff user."""
        mock_staff = MagicMock(spec=StaffUser)
        
        mock_session = AsyncMock()
        mock_session.add = MagicMock()
        mock_session.commit = AsyncMock()
        mock_session.refresh = AsyncMock()
        
        result = await staff_repo.create_staff(mock_session, mock_staff)
        
        mock_session.add.assert_called_once_with(mock_staff)
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once_with(mock_staff)
        assert result == mock_staff


class TestStudentRepository:
    """Tests for student repository functions."""

    @pytest.mark.asyncio
    async def test_get_student_by_code_found(self):
        """Test getting student by code when student exists."""
        mock_student = MagicMock(spec=Student)
        mock_student.student_code = "STU001"
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = mock_student
        
        mock_session = AsyncMock()
        mock_session.execute.return_value = mock_result
        
        result = await student_repo.get_student_by_code(mock_session, "STU001")
        
        assert result == mock_student

    @pytest.mark.asyncio
    async def test_get_student_by_code_not_found(self):
        """Test getting student by code when student doesn't exist."""
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = None
        
        mock_session = AsyncMock()
        mock_session.execute.return_value = mock_result
        
        result = await student_repo.get_student_by_code(mock_session, "NONEXISTENT")
        
        assert result is None

    @pytest.mark.asyncio
    async def test_get_student_by_id_found(self):
        """Test getting student by ID when student exists."""
        mock_student = MagicMock(spec=Student)
        mock_student.id = 1
        
        mock_session = AsyncMock()
        mock_session.get.return_value = mock_student
        
        result = await student_repo.get_student_by_id(mock_session, 1)
        
        assert result == mock_student
        mock_session.get.assert_called_once_with(Student, 1)

    @pytest.mark.asyncio
    async def test_get_student_by_id_not_found(self):
        """Test getting student by ID when student doesn't exist."""
        mock_session = AsyncMock()
        mock_session.get.return_value = None
        
        result = await student_repo.get_student_by_id(mock_session, 999)
        
        assert result is None

    @pytest.mark.asyncio
    async def test_get_student_by_code_and_school_found(self):
        """Test getting student by code and school when student exists."""
        mock_student = MagicMock(spec=Student)
        mock_student.student_code = "STU001"
        mock_student.school_id = 1
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = mock_student
        
        mock_session = AsyncMock()
        mock_session.execute.return_value = mock_result
        
        result = await student_repo.get_student_by_code_and_school(mock_session, "STU001", 1)
        
        assert result == mock_student

    @pytest.mark.asyncio
    async def test_get_student_by_code_and_school_not_found(self):
        """Test getting student by code and school when student doesn't exist."""
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = None
        
        mock_session = AsyncMock()
        mock_session.execute.return_value = mock_result
        
        result = await student_repo.get_student_by_code_and_school(mock_session, "STU001", 2)
        
        assert result is None

    @pytest.mark.asyncio
    async def test_list_students_by_school(self):
        """Test listing students by school."""
        mock_students = [MagicMock(spec=Student) for _ in range(3)]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_students
        
        mock_session = AsyncMock()
        mock_session.execute.return_value = mock_result
        
        result = await student_repo.list_students_by_school(mock_session, 1)
        
        assert result == mock_students
        assert len(result) == 3

    @pytest.mark.asyncio
    async def test_list_students_by_school_with_pagination(self):
        """Test listing students by school with pagination."""
        mock_students = [MagicMock(spec=Student) for _ in range(2)]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_students
        
        mock_session = AsyncMock()
        mock_session.execute.return_value = mock_result
        
        result = await student_repo.list_students_by_school(
            mock_session, 1, limit=2, offset=0
        )
        
        assert result == mock_students
        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_list_students_by_school_with_search(self):
        """Test listing students by school with search filter."""
        mock_students = [MagicMock(spec=Student)]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_students
        
        mock_session = AsyncMock()
        mock_session.execute.return_value = mock_result
        
        result = await student_repo.list_students_by_school(
            mock_session, 1, search="John"
        )
        
        assert result == mock_students
        assert len(result) == 1

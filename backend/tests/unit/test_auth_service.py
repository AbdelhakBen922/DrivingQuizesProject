"""Unit tests for authentication service."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from app.core.security import get_password_hash
from app.models.enums import StaffRole
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.services.auth import (
    authenticate_staff,
    authenticate_student,
    create_staff_token,
    create_student_token,
)


class TestAuthenticateStaff:
    """Tests for staff authentication."""

    @pytest.mark.asyncio
    async def test_authenticate_staff_success(self):
        """Test successful staff authentication."""
        password = "testpassword123"
        password_hash = get_password_hash(password)
        
        mock_staff = MagicMock(spec=StaffUser)
        mock_staff.id = 1
        mock_staff.email = "admin@test.com"
        mock_staff.password_hash = password_hash
        mock_staff.is_active = True
        mock_staff.school_id = 1
        mock_staff.role = StaffRole.ADMIN
        
        mock_session = AsyncMock()
        
        with patch("app.services.auth.staff_repo.get_staff_by_email", return_value=mock_staff):
            result = await authenticate_staff(mock_session, "admin@test.com", password)
            
            assert result == mock_staff

    @pytest.mark.asyncio
    async def test_authenticate_staff_invalid_email(self):
        """Test staff authentication with invalid email."""
        mock_session = AsyncMock()
        
        with patch("app.services.auth.staff_repo.get_staff_by_email", return_value=None):
            with pytest.raises(HTTPException) as exc_info:
                await authenticate_staff(mock_session, "invalid@test.com", "password")
            
            assert exc_info.value.status_code == 401
            assert exc_info.value.detail == "Invalid credentials"

    @pytest.mark.asyncio
    async def test_authenticate_staff_invalid_password(self):
        """Test staff authentication with invalid password."""
        password_hash = get_password_hash("correctpassword")
        
        mock_staff = MagicMock(spec=StaffUser)
        mock_staff.password_hash = password_hash
        mock_staff.is_active = True
        
        mock_session = AsyncMock()
        
        with patch("app.services.auth.staff_repo.get_staff_by_email", return_value=mock_staff):
            with pytest.raises(HTTPException) as exc_info:
                await authenticate_staff(mock_session, "admin@test.com", "wrongpassword")
            
            assert exc_info.value.status_code == 401
            assert exc_info.value.detail == "Invalid credentials"

    @pytest.mark.asyncio
    async def test_authenticate_staff_inactive_account(self):
        """Test staff authentication with inactive account."""
        password = "testpassword123"
        password_hash = get_password_hash(password)
        
        mock_staff = MagicMock(spec=StaffUser)
        mock_staff.password_hash = password_hash
        mock_staff.is_active = False
        
        mock_session = AsyncMock()
        
        with patch("app.services.auth.staff_repo.get_staff_by_email", return_value=mock_staff):
            with pytest.raises(HTTPException) as exc_info:
                await authenticate_staff(mock_session, "admin@test.com", password)
            
            assert exc_info.value.status_code == 403
            assert exc_info.value.detail == "Staff account disabled"


class TestAuthenticateStudent:
    """Tests for student authentication."""

    @pytest.mark.asyncio
    async def test_authenticate_student_success(self):
        """Test successful student authentication."""
        password = "studentpass123"
        password_hash = get_password_hash(password)
        
        mock_student = MagicMock(spec=Student)
        mock_student.id = 1
        mock_student.student_code = "STU001"
        mock_student.password_hash = password_hash
        mock_student.school_id = 1
        
        mock_session = AsyncMock()
        
        with patch("app.services.auth.student_repo.get_student_by_code", return_value=mock_student):
            result = await authenticate_student(mock_session, "STU001", password)
            
            assert result == mock_student

    @pytest.mark.asyncio
    async def test_authenticate_student_invalid_code(self):
        """Test student authentication with invalid student code."""
        mock_session = AsyncMock()
        
        with patch("app.services.auth.student_repo.get_student_by_code", return_value=None):
            with pytest.raises(HTTPException) as exc_info:
                await authenticate_student(mock_session, "INVALID", "password")
            
            assert exc_info.value.status_code == 401
            assert exc_info.value.detail == "Invalid credentials"

    @pytest.mark.asyncio
    async def test_authenticate_student_invalid_password(self):
        """Test student authentication with invalid password."""
        password_hash = get_password_hash("correctpassword")
        
        mock_student = MagicMock(spec=Student)
        mock_student.password_hash = password_hash
        
        mock_session = AsyncMock()
        
        with patch("app.services.auth.student_repo.get_student_by_code", return_value=mock_student):
            with pytest.raises(HTTPException) as exc_info:
                await authenticate_student(mock_session, "STU001", "wrongpassword")
            
            assert exc_info.value.status_code == 401
            assert exc_info.value.detail == "Invalid credentials"


class TestCreateTokens:
    """Tests for token creation."""

    @pytest.mark.asyncio
    async def test_create_staff_token(self):
        """Test creating a staff token."""
        mock_staff = MagicMock(spec=StaffUser)
        mock_staff.id = 1
        mock_staff.school_id = 1
        mock_staff.role = StaffRole.ADMIN
        
        token = await create_staff_token(mock_staff)
        
        assert isinstance(token, str)
        assert len(token) > 0

    @pytest.mark.asyncio
    async def test_create_student_token(self):
        """Test creating a student token."""
        mock_student = MagicMock(spec=Student)
        mock_student.id = 1
        mock_student.school_id = 1
        
        token = await create_student_token(mock_student)
        
        assert isinstance(token, str)
        assert len(token) > 0

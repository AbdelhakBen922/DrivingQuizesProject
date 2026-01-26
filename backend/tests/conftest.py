"""Pytest fixtures and configuration for backend tests."""
from __future__ import annotations

import asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.models.base import Base
from app.models.enums import StaffRole
from app.models.school import School
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.core.security import get_password_hash


# Use in-memory SQLite for testing (Note: Some PostgreSQL-specific features won't work)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def async_engine():
    """Create an async engine for testing."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture(scope="function")
async def async_session(async_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create an async session for testing."""
    async_session_maker = async_sessionmaker(
        async_engine,
        expire_on_commit=False,
        class_=AsyncSession,
    )
    
    async with async_session_maker() as session:
        yield session


@pytest.fixture
async def sample_school(async_session: AsyncSession) -> School:
    """Create a sample school for testing."""
    school = School(
        name="Test Driving School",
        email="school@test.com",
        password="testschoolpassword",
    )
    async_session.add(school)
    await async_session.commit()
    await async_session.refresh(school)
    return school


@pytest.fixture
async def sample_staff(async_session: AsyncSession, sample_school: School) -> StaffUser:
    """Create a sample staff user for testing."""
    staff = StaffUser(
        school_id=sample_school.id,
        email="admin@test.com",
        password_hash=get_password_hash("testpassword123"),
        role=StaffRole.ADMIN,
        first_name="Test",
        last_name="Admin",
        is_active=True,
    )
    async_session.add(staff)
    await async_session.commit()
    await async_session.refresh(staff)
    return staff


@pytest.fixture
async def sample_student(async_session: AsyncSession, sample_school: School, sample_staff: StaffUser) -> Student:
    """Create a sample student for testing."""
    student = Student(
        school_id=sample_school.id,
        full_name="John Doe",
        student_code="STU001",
        password_hash=get_password_hash("studentpass123"),
        email="john@test.com",
        phone="+1234567890",
        created_by_id=sample_staff.id,
    )
    async_session.add(student)
    await async_session.commit()
    await async_session.refresh(student)
    return student


@pytest.fixture
def mock_session() -> AsyncMock:
    """Create a mock async session for unit testing without database."""
    session = AsyncMock(spec=AsyncSession)
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.add = MagicMock()
    session.delete = AsyncMock()
    session.get = AsyncMock()
    return session


@pytest.fixture
def app() -> FastAPI:
    """Create a FastAPI application for testing."""
    from app.main import app as main_app
    return main_app


@pytest.fixture
async def async_client(app: FastAPI, async_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create an async HTTP client for testing API endpoints."""
    
    async def override_get_db():
        yield async_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    
    app.dependency_overrides.clear()

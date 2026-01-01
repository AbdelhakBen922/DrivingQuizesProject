from __future__ import annotations

from datetime import datetime, timedelta, timezone

import sqlalchemy as sa
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import get_current_staff
from app.core.database import get_db
from app.models.enums import RoomMembershipStatus
from app.models.learning_progress import LearningProgress
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.room import Room
from app.models.room_member import RoomMember
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.schemas.dashboard_overview import (
    DashboardExamResultPoint,
    DashboardOverviewMetrics,
    DashboardOverviewResponse,
    DashboardRecentRegistration,
    DashboardRoomProgress,
    DashboardStatsResponse,
    DashboardTopStudent,
)

router = APIRouter(prefix="/overview", tags=["dashboard-overview"])


async def _require_staff_school(staff: StaffUser) -> int:
    if staff.school_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Staff must belong to a school")
    return staff.school_id


async def _fetch_metrics(session: AsyncSession, school_id: int) -> DashboardOverviewMetrics:
    now = datetime.now(timezone.utc)

    rooms_stmt = select(func.count()).select_from(Room).where(
        Room.school_id == school_id,
        Room.deleted_at.is_(None),
    )
    students_stmt = select(func.count()).select_from(Student).where(
        Student.school_id == school_id,
        Student.deleted_at.is_(None),
    )
    upcoming_stmt = select(func.count()).select_from(Quiz).where(
        Quiz.school_id == school_id,
        Quiz.deleted_at.is_(None),
        Quiz.starts_at.is_not(None),
        Quiz.starts_at >= now,
    )
    active_stmt = select(func.count()).select_from(Quiz).where(
        Quiz.school_id == school_id,
        Quiz.deleted_at.is_(None),
        Quiz.starts_at.is_not(None),
        Quiz.starts_at <= now,
        sa.or_(Quiz.ends_at.is_(None), Quiz.ends_at >= now),
    )

    rooms_count = await session.scalar(rooms_stmt) or 0
    students_count = await session.scalar(students_stmt) or 0
    upcoming_count = await session.scalar(upcoming_stmt) or 0
    active_count = await session.scalar(active_stmt) or 0

    return DashboardOverviewMetrics(
        total_rooms=rooms_count,
        total_students=students_count,
        upcoming_quizzes=upcoming_count,
        active_quizzes=active_count,
    )


async def _fetch_exam_results(session: AsyncSession, school_id: int) -> list[DashboardExamResultPoint]:
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(days=180)

    attempt_timestamp = func.coalesce(QuizAttempt.finished_at, QuizAttempt.started_at)
    month_bucket = func.date_trunc("month", attempt_timestamp).label("bucket")

    stmt = (
        select(
            month_bucket,
            func.avg(QuizAttempt.score).label("avg_score"),
            func.count(QuizAttempt.id).label("attempts"),
        )
        .join(Quiz, Quiz.id == QuizAttempt.quiz_id)
        .where(
            Quiz.school_id == school_id,
            Quiz.deleted_at.is_(None),
            attempt_timestamp.is_not(None),
            attempt_timestamp >= window_start,
        )
        .group_by(month_bucket)
        .order_by(month_bucket)
    )

    rows = await session.execute(stmt)
    return [
        DashboardExamResultPoint(
            month=row.bucket,
            average_score=float(row.avg_score or 0.0),
            attempt_count=int(row.attempts or 0),
        )
        for row in rows
    ]


async def _fetch_study_progress(session: AsyncSession, school_id: int) -> list[DashboardRoomProgress]:
    percent_expr = sa.cast(LearningProgress.progress_data["percent_complete"].astext, sa.Float)
    avg_percent = func.coalesce(func.avg(percent_expr), 0.0)

    stmt = (
        select(
            Room.id.label("room_id"),
            Room.name.label("room_name"),
            avg_percent.label("completion"),
        )
        .join(RoomMember, RoomMember.room_id == Room.id)
        .join(Student, Student.id == RoomMember.student_id)
        .join(LearningProgress, LearningProgress.student_id == Student.id, isouter=True)
        .where(
            Room.school_id == school_id,
            Room.deleted_at.is_(None),
            RoomMember.status == RoomMembershipStatus.ACTIVE,
            RoomMember.student_id.is_not(None),
        )
        .group_by(Room.id)
        .order_by(avg_percent.desc(), Room.name.asc())
        .limit(4)
    )

    rows = await session.execute(stmt)
    return [
        DashboardRoomProgress(
            room_id=row.room_id,
            room_name=row.room_name,
            completion_percent=float(row.completion or 0.0),
        )
        for row in rows
    ]


async def _fetch_recent_registrations(session: AsyncSession, school_id: int) -> list[DashboardRecentRegistration]:
    room_name_subquery = (
        select(Room.name)
        .join(RoomMember, RoomMember.room_id == Room.id)
        .where(
            RoomMember.student_id == Student.id,
            RoomMember.status == RoomMembershipStatus.ACTIVE,
        )
        .order_by(RoomMember.joined_at.desc().nullslast())
        .limit(1)
        .scalar_subquery()
    )

    stmt = (
        select(
            Student.id.label("student_id"),
            Student.full_name,
            Student.created_at,
            room_name_subquery.label("room_name"),
        )
        .where(
            Student.school_id == school_id,
            Student.deleted_at.is_(None),
        )
        .order_by(Student.created_at.desc())
        .limit(5)
    )

    rows = await session.execute(stmt)
    return [
        DashboardRecentRegistration(
            student_id=row.student_id,
            full_name=row.full_name,
            room_name=row.room_name,
            created_at=row.created_at,
        )
        for row in rows
    ]


async def _fetch_top_students(session: AsyncSession, school_id: int) -> list[DashboardTopStudent]:
    stmt = (
        select(
            Student.id.label("student_id"),
            Student.full_name,
            func.avg(QuizAttempt.score).label("avg_score"),
            func.count(QuizAttempt.id).label("attempts"),
        )
        .join(RoomMember, RoomMember.student_id == Student.id)
        .join(QuizAttempt, QuizAttempt.room_member_id == RoomMember.id)
        .join(Quiz, Quiz.id == QuizAttempt.quiz_id)
        .where(
            Student.school_id == school_id,
            Student.deleted_at.is_(None),
            RoomMember.status == RoomMembershipStatus.ACTIVE,
            RoomMember.student_id.is_not(None),
            Quiz.deleted_at.is_(None),
        )
        .group_by(Student.id)
        .order_by(func.avg(QuizAttempt.score).desc(), func.count(QuizAttempt.id).desc())
        .limit(5)
    )

    rows = await session.execute(stmt)
    return [
        DashboardTopStudent(
            student_id=row.student_id,
            full_name=row.full_name,
            average_score=float(row.avg_score or 0.0),
            attempt_count=int(row.attempts or 0),
        )
        for row in rows
    ]


async def _fetch_staff_count(session: AsyncSession, school_id: int) -> int:
    stmt = select(func.count()).select_from(StaffUser).where(
        StaffUser.school_id == school_id,
        StaffUser.is_active.is_(True),
    )
    return await session.scalar(stmt) or 0


@router.get("/", response_model=DashboardOverviewResponse)
async def get_dashboard_overview(
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> DashboardOverviewResponse:
    school_id = await _require_staff_school(current_staff)

    metrics = await _fetch_metrics(session, school_id)
    exam_results = await _fetch_exam_results(session, school_id)
    study_progress = await _fetch_study_progress(session, school_id)
    recent_regs = await _fetch_recent_registrations(session, school_id)
    top_students = await _fetch_top_students(session, school_id)

    return DashboardOverviewResponse(
        metrics=metrics,
        exam_results=exam_results,
        study_progress=study_progress,
        recent_registrations=recent_regs,
        top_students=top_students,
    )


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> DashboardStatsResponse:
    school_id = await _require_staff_school(current_staff)
    metrics = await _fetch_metrics(session, school_id)
    staff_count = await _fetch_staff_count(session, school_id)
    return DashboardStatsResponse(
        total_groups=metrics.total_rooms,
        total_students=metrics.total_students,
        total_instructors=staff_count,
        active_exams=metrics.active_quizzes,
    )

from __future__ import annotations

from datetime import datetime

from app.schemas.base import ORMModel


class DashboardOverviewMetrics(ORMModel):
    total_rooms: int
    total_students: int
    upcoming_quizzes: int
    active_quizzes: int


class DashboardExamResultPoint(ORMModel):
    month: datetime
    average_score: float
    attempt_count: int


class DashboardRoomProgress(ORMModel):
    room_id: int
    room_name: str
    completion_percent: float


class DashboardRecentRegistration(ORMModel):
    student_id: int
    full_name: str
    room_name: str | None
    created_at: datetime


class DashboardTopStudent(ORMModel):
    student_id: int
    full_name: str
    average_score: float
    attempt_count: int


class DashboardOverviewResponse(ORMModel):
    metrics: DashboardOverviewMetrics
    exam_results: list[DashboardExamResultPoint]
    study_progress: list[DashboardRoomProgress]
    recent_registrations: list[DashboardRecentRegistration]
    top_students: list[DashboardTopStudent]


class DashboardStatsResponse(ORMModel):
    total_groups: int
    total_students: int
    total_instructors: int
    active_exams: int

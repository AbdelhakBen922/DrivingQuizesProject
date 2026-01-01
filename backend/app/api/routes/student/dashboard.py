from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from app.api.deps.auth import get_current_student
from app.core.database import get_db
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.room_member import RoomMember
from app.models.student import Student
from pydantic import BaseModel

router = APIRouter(prefix="/dashboard", tags=["student-dashboard"])


class StudentDashboardOverview(BaseModel):
    total_quizzes: int
    completed_quizzes: int
    pending_quizzes: int
    average_score: float
    student_name: str
    student_code: str


class AssignedQuizItem(BaseModel):
    quiz_id: int
    title: str
    description: str | None
    room_name: str
    starts_at: datetime | None
    due_date: datetime | None
    time_limit_minutes: int | None
    total_questions: int
    status: str  # "not_started", "in_progress", "completed"
    best_score: float | None
    attempts_count: int
    max_attempts: int | None
    latest_attempt_id: int | None
    is_active: bool  # Whether quiz is currently available to take


@router.get("/overview", response_model=StudentDashboardOverview)
async def get_student_dashboard_overview(
    current_student: Student = Depends(get_current_student),
    session: AsyncSession = Depends(get_db),
) -> StudentDashboardOverview:
    """Get student dashboard overview with stats"""
    
    # Get student's room memberships with IDs
    room_members_query = select(RoomMember).where(
        RoomMember.student_id == current_student.id,
        RoomMember.left_at.is_(None)  # Active memberships only
    )
    room_members_result = await session.execute(room_members_query)
    room_members = room_members_result.scalars().all()
    
    room_ids = [rm.room_id for rm in room_members]
    room_member_ids = [rm.id for rm in room_members]
    
    # Get total quizzes assigned to student's rooms
    if room_ids:
        total_quizzes_query = select(func.count(Quiz.id.distinct())).where(
            Quiz.room_id.in_(room_ids),
            Quiz.deleted_at.is_(None)
        )
        total_quizzes_result = await session.execute(total_quizzes_query)
        total_quizzes = total_quizzes_result.scalar() or 0
    else:
        total_quizzes = 0
    
    # Get student's quiz attempts using room_member_id
    if room_member_ids:
        attempts_query = select(QuizAttempt).where(
            QuizAttempt.room_member_id.in_(room_member_ids)
        )
        attempts_result = await session.execute(attempts_query)
        attempts = attempts_result.scalars().all()
    else:
        attempts = []
    
    # Calculate completed quizzes (unique quiz_ids with at least one attempt)
    completed_quiz_ids = set()
    total_score = 0
    attempt_count = 0
    
    for attempt in attempts:
        if attempt.quiz_id:
            completed_quiz_ids.add(attempt.quiz_id)
        if attempt.score is not None:
            total_score += attempt.score
            attempt_count += 1
    
    completed_quizzes = len(completed_quiz_ids)
    pending_quizzes = max(0, total_quizzes - completed_quizzes)
    average_score = round(total_score / attempt_count, 2) if attempt_count > 0 else 0.0
    
    return StudentDashboardOverview(
        total_quizzes=total_quizzes,
        completed_quizzes=completed_quizzes,
        pending_quizzes=pending_quizzes,
        average_score=average_score,
        student_name=current_student.full_name,
        student_code=current_student.student_code,
    )


@router.get("/quizzes/assigned", response_model=list[AssignedQuizItem])
async def get_assigned_quizzes(
    current_student: Student = Depends(get_current_student),
    session: AsyncSession = Depends(get_db),
) -> list[AssignedQuizItem]:
    """Get quizzes assigned to student's rooms"""
    from app.models.room import Room
    from app.models.quiz_setting import QuizSetting
    
    # Get student's active room memberships
    room_members_query = select(RoomMember, Room).join(
        Room, RoomMember.room_id == Room.id
    ).where(
        RoomMember.student_id == current_student.id,
        RoomMember.left_at.is_(None)
    )
    room_members_result = await session.execute(room_members_query)
    room_memberships = room_members_result.all()
    
    if not room_memberships:
        return []
    
    room_ids = [rm.RoomMember.room_id for rm in room_memberships]
    room_names = {rm.Room.id: rm.Room.name for rm in room_memberships}
    room_member_ids = [rm.RoomMember.id for rm in room_memberships]
    
    # Get quizzes for these rooms
    quizzes_query = select(Quiz, QuizSetting).outerjoin(
        QuizSetting, Quiz.setting_id == QuizSetting.id
    ).where(
        Quiz.room_id.in_(room_ids),
        Quiz.deleted_at.is_(None)
    ).order_by(Quiz.created_at.desc())
    
    quizzes_result = await session.execute(quizzes_query)
    quizzes_data = quizzes_result.all()
    
    # Get student's attempts for these quizzes using room_member_id
    quiz_ids = [q.Quiz.id for q in quizzes_data]
    if quiz_ids and room_member_ids:
        attempts_query = select(QuizAttempt).where(
            QuizAttempt.room_member_id.in_(room_member_ids),
            QuizAttempt.quiz_id.in_(quiz_ids)
        )
        attempts_result = await session.execute(attempts_query)
        all_attempts = attempts_result.scalars().all()
    else:
        all_attempts = []
    
    # Group attempts by quiz_id
    attempts_by_quiz = {}
    for attempt in all_attempts:
        if attempt.quiz_id not in attempts_by_quiz:
            attempts_by_quiz[attempt.quiz_id] = []
        attempts_by_quiz[attempt.quiz_id].append(attempt)
    
    # Build response
    assigned_quizzes = []
    for quiz_row in quizzes_data:
        quiz = quiz_row.Quiz
        settings = quiz_row.QuizSetting
        
        quiz_attempts = attempts_by_quiz.get(quiz.id, [])
        attempts_count = len(quiz_attempts)
        
        # Determine status
        if attempts_count == 0:
            status = "not_started"
        elif any(a.finished_at is not None for a in quiz_attempts):
            status = "completed"
        else:
            status = "in_progress"
        
        # Get best score
        completed_attempts = [a for a in quiz_attempts if a.score is not None]
        best_score = max((a.score for a in completed_attempts), default=None)
        
        # Get latest attempt ID (most recent)
        latest_attempt_id = None
        if quiz_attempts:
            latest_attempt = max(quiz_attempts, key=lambda a: a.started_at or datetime.min)
            latest_attempt_id = latest_attempt.id
        
        # Check if quiz is currently active
        from datetime import timezone
        current_time = datetime.now(timezone.utc)
        is_active = True
        if quiz.starts_at and current_time < quiz.starts_at:
            is_active = False
        if quiz.ends_at and current_time > quiz.ends_at:
            is_active = False
        
        assigned_quizzes.append(AssignedQuizItem(
            quiz_id=quiz.id,
            title=quiz.title_ar or quiz.title_fr,
            description=quiz.description,
            room_name=room_names.get(quiz.room_id, "Unknown"),
            starts_at=quiz.starts_at,
            due_date=quiz.ends_at,
            time_limit_minutes=None,  # Not available in current schema
            total_questions=settings.question_count if settings else 0,
            status=status,
            best_score=best_score,
            attempts_count=attempts_count,
            max_attempts=None,  # Not available in current schema
            latest_attempt_id=latest_attempt_id,
            is_active=is_active,
        ))
    
    return assigned_quizzes


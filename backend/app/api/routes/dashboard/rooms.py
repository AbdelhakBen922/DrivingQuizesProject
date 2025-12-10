from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import get_current_staff
from app.core.database import get_db
from app.models.enums import RoomMembershipStatus
from app.models.quiz import Quiz
from app.models.room import Room
from app.models.room_member import RoomMember
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.schemas.room import RoomCreateRequest, RoomDetail, RoomQuizSummary, RoomRead, RoomStudentSummary
from app.schemas.room_member import RoomMemberAddRequest, RoomMemberRead
from app.schemas.room_assignment import RoomQuizAssignRequest
from app.schemas.quiz import QuizRead

router = APIRouter(prefix="/rooms", tags=["dashboard-rooms"])


def _require_staff_school(staff: StaffUser) -> int:
    if staff.school_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Staff must belong to a school")
    return staff.school_id


async def _get_room_for_staff(session: AsyncSession, room_id: int, staff: StaffUser) -> Room:
    room = await session.get(Room, room_id)
    if not room or room.school_id != staff.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return room


async def _get_student_for_staff(session: AsyncSession, student_id: int, staff: StaffUser) -> Student:
    student = await session.get(Student, student_id)
    if not student or student.school_id != staff.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


async def _get_room_member_record(
    session: AsyncSession, room_id: int, student_id: int
) -> RoomMember | None:
    stmt = select(RoomMember).where(RoomMember.room_id == room_id, RoomMember.student_id == student_id)
    result = await session.execute(stmt)
    return result.scalars().first()


async def _get_quiz_for_staff(session: AsyncSession, quiz_id: int, staff: StaffUser) -> Quiz:
    quiz = await session.get(Quiz, quiz_id)
    if not quiz or (quiz.school_id is not None and quiz.school_id != staff.school_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    return quiz


async def _assign_quiz_to_room_record(session: AsyncSession, room: Room, quiz: Quiz) -> Quiz:
    if quiz.room_id and quiz.room_id != room.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quiz already assigned to another room")

    if quiz.school_id is not None and quiz.school_id != room.school_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz must belong to the same school as the room",
        )

    quiz.room_id = room.id
    if quiz.school_id is None:
        quiz.school_id = room.school_id

    await session.commit()
    result = await session.execute(
        select(Quiz)
        .options(selectinload(Quiz.setting), selectinload(Quiz.template))
        .where(Quiz.id == quiz.id)
    )
    return result.scalar_one()


def _map_member_to_summary(member: RoomMember) -> RoomStudentSummary:
    student = member.student
    return RoomStudentSummary(
        membership_id=member.id,
        student_id=student.id if student else None,
        full_name=student.full_name if student else None,
        student_code=student.student_code if student else None,
        email=student.email if student else None,
        status=member.status,
        joined_at=member.joined_at,
        left_at=member.left_at,
    )


async def _collect_room_students(session: AsyncSession, room_id: int, active_only: bool = True) -> list[RoomStudentSummary]:
    stmt = (
        select(RoomMember)
        .options(selectinload(RoomMember.student))
        .where(RoomMember.room_id == room_id)
    )
    if active_only:
        stmt = stmt.where(RoomMember.status == RoomMembershipStatus.ACTIVE)
    result = await session.execute(stmt)
    members = result.scalars().all()
    return [_map_member_to_summary(member) for member in members]


@router.get("/", response_model=list[RoomRead])
async def list_rooms(
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> list[RoomRead]:
    school_id = _require_staff_school(current_staff)
    stmt = (
        select(Room)
        .where(Room.school_id == school_id, Room.deleted_at.is_(None))
        .order_by(Room.created_at.desc())
    )
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/{room_id}", response_model=RoomDetail)
async def get_room_detail(
    room_id: int,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> RoomDetail:
    stmt = (
        select(Room)
        .options(selectinload(Room.members).selectinload(RoomMember.student))
        .where(Room.id == room_id, Room.school_id == current_staff.school_id)
    )
    result = await session.execute(stmt)
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    students = [_map_member_to_summary(member) for member in room.members]

    quizzes_stmt = (
        select(Quiz)
        .where(Quiz.room_id == room.id, Quiz.deleted_at.is_(None))
        .order_by(Quiz.created_at.desc())
    )
    quizzes_result = await session.execute(quizzes_stmt)
    quizzes = [
        RoomQuizSummary(
            id=quiz.id,
            title=quiz.title,
            template_id=quiz.template_id,
            starts_at=quiz.starts_at,
            ends_at=quiz.ends_at,
        )
        for quiz in quizzes_result.scalars().all()
    ]

    return RoomDetail(
        room=RoomRead.model_validate(room),
        students=students,
        quizzes=quizzes,
    )


@router.post("/", response_model=RoomRead, status_code=status.HTTP_201_CREATED)
async def create_room(
    payload: RoomCreateRequest,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> RoomRead:
    school_id = _require_staff_school(current_staff)
    room = Room(
        name=payload.name,
        description=payload.description,
        room_type=payload.room_type,
        school_id=school_id,
        created_by_id=current_staff.id,
    )
    session.add(room)
    await session.commit()
    await session.refresh(room)
    return room


@router.get("/{room_id}/students", response_model=list[RoomStudentSummary])
async def list_room_students(
    room_id: int,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> list[RoomStudentSummary]:
    await _get_room_for_staff(session, room_id, current_staff)
    return await _collect_room_students(session, room_id, active_only=False)


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: int,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> Response:
    room = await _get_room_for_staff(session, room_id, current_staff)
    await session.delete(room)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{room_id}/members",
    response_model=RoomMemberRead,
)
async def add_student_to_room(
    room_id: int,
    payload: RoomMemberAddRequest,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> RoomMemberRead:
    room = await _get_room_for_staff(session, room_id, current_staff)
    student = await _get_student_for_staff(session, payload.student_id, current_staff)

    member = await _get_room_member_record(session, room.id, student.id)
    now = datetime.now(timezone.utc)
    if member:
        member.status = RoomMembershipStatus.ACTIVE
        member.left_at = None
        if member.joined_at is None:
            member.joined_at = now
    else:
        member = RoomMember(
            room_id=room.id,
            student_id=student.id,
            status=RoomMembershipStatus.ACTIVE,
            joined_at=now,
        )
        session.add(member)

    await session.commit()
    await session.refresh(member)
    return member


@router.delete("/{room_id}/members/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_student_from_room(
    room_id: int,
    student_id: int,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> Response:
    await _get_room_for_staff(session, room_id, current_staff)
    member = await _get_room_member_record(session, room_id, student_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership not found")

    member.status = RoomMembershipStatus.REMOVED
    member.left_at = datetime.now(timezone.utc)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{room_id}/assign-quiz", response_model=QuizRead, status_code=status.HTTP_200_OK)
async def assign_quiz_to_room(
    room_id: int,
    payload: RoomQuizAssignRequest,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> QuizRead:
    room = await _get_room_for_staff(session, room_id, current_staff)
    quiz = await _get_quiz_for_staff(session, payload.quiz_id, current_staff)
    return await _assign_quiz_to_room_record(session, room, quiz)


@router.delete("/{room_id}/quizzes/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_quiz_from_room(
    room_id: int,
    quiz_id: int,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> Response:
    room = await _get_room_for_staff(session, room_id, current_staff)
    quiz = await _get_quiz_for_staff(session, quiz_id, current_staff)
    if quiz.room_id != room.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not assigned to this room")

    quiz.room_id = None
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

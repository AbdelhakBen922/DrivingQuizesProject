from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import get_current_staff
from app.core.database import get_db
from app.models.enums import RoomMembershipStatus
from app.models.quiz import Quiz
from app.models.room import Room
from app.models.room_member import RoomMember
from app.models.room_quiz import RoomQuiz
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.schemas.room import RoomCreateRequest, RoomRead
from app.schemas.room_member import RoomMemberAddRequest, RoomMemberRead
from app.schemas.room_quiz import RoomQuizAssignRequest, RoomQuizRead

router = APIRouter(prefix="/rooms", tags=["dashboard-rooms"])


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


@router.post("/", response_model=RoomRead, status_code=status.HTTP_201_CREATED)
async def create_room(
    payload: RoomCreateRequest,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> RoomRead:
    room = Room(
        name=payload.name,
        description=payload.description,
        room_type=payload.room_type,
        school_id=current_staff.school_id,
        created_by_id=current_staff.id,
    )
    session.add(room)
    await session.commit()
    await session.refresh(room)
    return room


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


@router.post(
    "/{room_id}/quizzes",
    response_model=RoomQuizRead,
    status_code=status.HTTP_201_CREATED,
)
async def assign_quiz_to_room(
    room_id: int,
    payload: RoomQuizAssignRequest,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> RoomQuizRead:
    room = await _get_room_for_staff(session, room_id, current_staff)
    quiz = await _get_quiz_for_staff(session, payload.quiz_id, current_staff)

    existing_stmt = select(RoomQuiz).where(RoomQuiz.room_id == room.id, RoomQuiz.quiz_id == quiz.id)
    existing = await session.execute(existing_stmt)
    if existing.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quiz already published to room")

    room_quiz = RoomQuiz(
        room_id=room.id,
        quiz_id=quiz.id,
        status=payload.status,
        instance_settings=payload.instance_settings or {},
    )
    session.add(room_quiz)
    await session.commit()
    await session.refresh(room_quiz)
    return room_quiz


@router.delete("/{room_id}/quizzes/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_quiz_from_room(
    room_id: int,
    quiz_id: int,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> Response:
    await _get_room_for_staff(session, room_id, current_staff)
    stmt = select(RoomQuiz).where(RoomQuiz.room_id == room_id, RoomQuiz.quiz_id == quiz_id)
    result = await session.execute(stmt)
    room_quiz = result.scalars().first()
    if not room_quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room quiz not found")

    await session.delete(room_quiz)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

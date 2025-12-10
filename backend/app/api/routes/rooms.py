from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.enums import RoomMembershipStatus
from app.models.room import Room
from app.models.room_member import RoomMember
from app.models.school import School
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.schemas.room import RoomCreate, RoomRead, RoomUpdate
from app.schemas.room_member import RoomMemberCreate, RoomMemberRead, RoomMemberUpdate

router = APIRouter()


async def _get_school(session: AsyncSession, school_id: int) -> School:
    school = await session.get(School, school_id)
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")
    return school


async def _get_staff(session: AsyncSession, staff_id: int) -> StaffUser:
    staff = await session.get(StaffUser, staff_id)
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff user not found")
    return staff


async def _get_student(session: AsyncSession, student_id: int) -> Student:
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


async def _get_room(session: AsyncSession, room_id: int) -> Room:
    room = await session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return room


async def _get_room_member(session: AsyncSession, member_id: int) -> RoomMember:
    member = await session.get(RoomMember, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room member not found")
    return member


@router.post("/rooms", response_model=RoomRead, status_code=status.HTTP_201_CREATED, tags=["rooms"])
async def create_room(payload: RoomCreate, session: AsyncSession = Depends(get_db)) -> Room:
    data = payload.model_dump(exclude_unset=True)
    school = await _get_school(session, data["school_id"])

    created_by_id = data.get("created_by_id")
    if created_by_id is not None:
        staff = await _get_staff(session, created_by_id)
        if staff.school_id != school.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff user must belong to the same school",
            )

    room = Room(**data)
    session.add(room)
    await session.commit()
    await session.refresh(room)
    return room


@router.get("/rooms", response_model=list[RoomRead], tags=["rooms"])
async def list_rooms(
    session: AsyncSession = Depends(get_db),
    school_id: int | None = Query(default=None),
) -> list[Room]:
    stmt = select(Room).order_by(Room.created_at.desc())
    if school_id is not None:
        stmt = stmt.where(Room.school_id == school_id)
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/rooms/{room_id}", response_model=RoomRead, tags=["rooms"])
async def get_room(room_id: int, session: AsyncSession = Depends(get_db)) -> Room:
    return await _get_room(session, room_id)


@router.patch("/rooms/{room_id}", response_model=RoomRead, tags=["rooms"])
async def update_room(
    room_id: int, payload: RoomUpdate, session: AsyncSession = Depends(get_db)
) -> Room:
    room = await _get_room(session, room_id)
    data = payload.model_dump(exclude_unset=True)

    new_school_id = data.get("school_id")
    target_school_id = new_school_id or room.school_id
    if new_school_id is not None:
        await _get_school(session, new_school_id)

    new_creator_id = data.get("created_by_id")
    if new_creator_id is not None:
        staff = await _get_staff(session, new_creator_id)
        if target_school_id is not None and staff.school_id != target_school_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff user must belong to the same school",
            )

    for field, value in data.items():
        setattr(room, field, value)

    await session.commit()
    await session.refresh(room)
    return room


@router.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["rooms"])
async def delete_room(room_id: int, session: AsyncSession = Depends(get_db)) -> Response:
    room = await _get_room(session, room_id)
    await session.delete(room)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/room-members",
    response_model=RoomMemberRead,
    status_code=status.HTTP_201_CREATED,
    tags=["room-members"],
)
async def create_room_member(
    payload: RoomMemberCreate, session: AsyncSession = Depends(get_db)
) -> RoomMember:
    data = payload.model_dump(exclude_unset=True)
    room = await _get_room(session, data["room_id"])

    student_id = data.get("student_id")
    if student_id is not None:
        student = await _get_student(session, student_id)
        if student.school_id != room.school_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student must belong to the same school as the room",
            )

    member = RoomMember(**data)
    session.add(member)
    await session.commit()
    await session.refresh(member)
    return member


@router.get("/room-members", response_model=list[RoomMemberRead], tags=["room-members"])
async def list_room_members(
    session: AsyncSession = Depends(get_db),
    room_id: int | None = Query(default=None),
    student_id: int | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
) -> list[RoomMember]:
    stmt = select(RoomMember).order_by(RoomMember.joined_at.desc())
    if room_id is not None:
        stmt = stmt.where(RoomMember.room_id == room_id)
    if student_id is not None:
        stmt = stmt.where(RoomMember.student_id == student_id)
    if status_filter is not None:
        try:
            status_value = RoomMembershipStatus(status_filter)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status filter")
        stmt = stmt.where(RoomMember.status == status_value)
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/room-members/{member_id}", response_model=RoomMemberRead, tags=["room-members"])
async def get_room_member(member_id: int, session: AsyncSession = Depends(get_db)) -> RoomMember:
    return await _get_room_member(session, member_id)


@router.patch("/room-members/{member_id}", response_model=RoomMemberRead, tags=["room-members"])
async def update_room_member(
    member_id: int,
    payload: RoomMemberUpdate,
    session: AsyncSession = Depends(get_db),
) -> RoomMember:
    member = await _get_room_member(session, member_id)
    data = payload.model_dump(exclude_unset=True)

    new_room_id = data.get("room_id")
    room = await _get_room(session, new_room_id) if new_room_id is not None else await _get_room(session, member.room_id)

    student_id = data.get("student_id") or member.student_id
    if student_id is not None:
        student = await _get_student(session, student_id)
        if student.school_id != room.school_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student must belong to the same school as the room",
            )

    for field, value in data.items():
        setattr(member, field, value)

    await session.commit()
    await session.refresh(member)
    return member


@router.delete("/room-members/{member_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["room-members"])
async def delete_room_member(member_id: int, session: AsyncSession = Depends(get_db)) -> Response:
    member = await _get_room_member(session, member_id)
    await session.delete(member)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)



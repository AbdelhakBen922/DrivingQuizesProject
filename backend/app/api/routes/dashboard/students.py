from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import get_current_staff
from app.core.database import get_db
from app.models.staff_user import StaffUser
from app.schemas.student import StudentCreateRequest, StudentRead, StudentUpdateRequest
from app.services import student as student_service

router = APIRouter(prefix="/students", tags=["dashboard-students"])


@router.get("/", response_model=list[StudentRead], response_model_exclude={"password_hash"})
async def list_dashboard_students(
    limit: int | None = Query(default=20, ge=1, le=100),
    offset: int | None = Query(default=0, ge=0),
    search: str | None = Query(default=None, min_length=1),
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> list[StudentRead]:
    return await student_service.list_students(
        session,
        current_staff=current_staff,
        limit=limit,
        offset=offset,
        search=search,
    )


@router.post(
    "/",
    response_model=StudentRead,
    response_model_exclude={"password_hash"},
    status_code=status.HTTP_201_CREATED,
)
async def create_dashboard_student(
    payload: StudentCreateRequest,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> StudentRead:
    student = await student_service.create_student(session, payload, current_staff=current_staff)
    return student


@router.get("/{student_id}", response_model=StudentRead, response_model_exclude={"password_hash"})
async def get_dashboard_student(
    student_id: int,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> StudentRead:
    return await student_service.get_student(session, student_id, current_staff=current_staff)


@router.put("/{student_id}", response_model=StudentRead, response_model_exclude={"password_hash"})
async def update_dashboard_student(
    student_id: int,
    payload: StudentUpdateRequest,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> StudentRead:
    student = await student_service.update_student(
        session,
        student_id,
        payload,
        current_staff=current_staff,
    )
    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dashboard_student(
    student_id: int,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> Response:
    await student_service.delete_student(session, student_id, current_staff=current_staff)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

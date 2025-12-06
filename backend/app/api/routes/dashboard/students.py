from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import get_current_staff
from app.core.database import get_db
from app.models.staff_user import StaffUser
from app.schemas.student import StudentCreateRequest, StudentRead
from app.services import student as student_service

router = APIRouter(prefix="/students", tags=["dashboard-students"])


@router.get("/", response_model=list[StudentRead], response_model_exclude={"password_hash"})
async def list_dashboard_students(
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> list[StudentRead]:
    return await student_service.list_students(session, current_staff=current_staff)


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

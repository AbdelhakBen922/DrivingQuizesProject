from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import get_current_staff
from app.core.database import get_db
from app.models.staff_user import StaffUser
from app.schemas.staff_user import StaffUserCreateRequest, StaffUserRead
from app.services import staff as staff_service

router = APIRouter(prefix="/staff", tags=["dashboard-staff"])


@router.post("/", response_model=StaffUserRead, status_code=status.HTTP_201_CREATED)
async def create_staff_member(
    payload: StaffUserCreateRequest,
    session: AsyncSession = Depends(get_db),
    current_staff: StaffUser = Depends(get_current_staff),
) -> StaffUserRead:
    staff = await staff_service.create_staff_user(
        session,
        payload,
        current_staff=current_staff,
    )
    return staff

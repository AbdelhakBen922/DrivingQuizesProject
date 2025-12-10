from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth import StaffLoginRequest, Token
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["dashboard-auth"])


@router.post("/login", response_model=Token)
async def dashboard_login(payload: StaffLoginRequest, session: AsyncSession = Depends(get_db)) -> Token:
    staff = await auth_service.authenticate_staff(session, payload.email, payload.password)
    token = await auth_service.create_staff_token(staff)
    return Token(access_token=token)

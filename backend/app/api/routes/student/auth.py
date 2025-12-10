from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth import StudentLoginRequest, Token
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["student-auth"])


@router.post("/login", response_model=Token)
async def student_login(payload: StudentLoginRequest, session: AsyncSession = Depends(get_db)) -> Token:
    student = await auth_service.authenticate_student(session, payload.student_code, payload.password)
    token = await auth_service.create_student_token(student)
    return Token(access_token=token)

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import TokenDecodeError, decode_access_token
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.repositories import staff as staff_repo
from app.repositories import student as student_repo

bearer_scheme = HTTPBearer(auto_error=False)


async def _get_token_payload(credentials: HTTPAuthorizationCredentials | None) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except TokenDecodeError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from None
    return payload.model_dump()


async def get_current_staff(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_db),
) -> StaffUser:
    payload = await _get_token_payload(credentials)
    if payload.get("scope") != "staff":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff scope required")

    staff = await staff_repo.get_staff_by_id(session, int(payload["sub"]))
    if not staff:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Staff not found")
    if not staff.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff account disabled")
    return staff


async def get_current_student(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_db),
) -> Student:
    payload = await _get_token_payload(credentials)
    if payload.get("scope") != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student scope required")

    student = await student_repo.get_student_by_id(session, int(payload["sub"]))
    if not student:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Student not found")
    return student

from fastapi import APIRouter, Depends

from app.api.deps.auth import get_current_student
from app.models.student import Student

router = APIRouter(prefix="/rooms", tags=["student-rooms"])


@router.get("/")
async def list_student_rooms_stub(current_student: Student = Depends(get_current_student)) -> dict:
    return {
        "items": [],
        "detail": f"student rooms not yet implemented for student {current_student.id}",
    }

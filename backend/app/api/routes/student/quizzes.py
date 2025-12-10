from fastapi import APIRouter, Depends

from app.api.deps.auth import get_current_student
from app.models.student import Student

router = APIRouter(prefix="/quizzes", tags=["student-quizzes"])


@router.get("/")
async def list_student_quizzes_stub(current_student: Student = Depends(get_current_student)) -> dict:
    return {
        "items": [],
        "detail": f"student quizzes not yet implemented for student {current_student.id}",
    }

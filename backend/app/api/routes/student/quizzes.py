from fastapi import APIRouter

router = APIRouter(prefix="/quizzes", tags=["student-quizzes"])

@router.get("/")
async def list_student_quizzes_stub() -> dict:
    return {"items": [], "detail": "student quizzes not yet implemented"}

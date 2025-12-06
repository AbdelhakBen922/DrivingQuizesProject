from fastapi import APIRouter

router = APIRouter(prefix="/quizzes", tags=["dashboard-quizzes"])

@router.get("/")
async def list_dashboard_quizzes_stub() -> dict:
    return {"items": [], "detail": "dashboard quizzes not yet implemented"}

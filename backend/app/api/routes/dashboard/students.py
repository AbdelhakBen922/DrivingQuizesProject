from fastapi import APIRouter

router = APIRouter(prefix="/students", tags=["dashboard-students"])

@router.get("/")
async def list_dashboard_students_stub() -> dict:
    return {"items": [], "detail": "student listing not yet implemented"}

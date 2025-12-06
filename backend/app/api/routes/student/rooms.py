from fastapi import APIRouter

router = APIRouter(prefix="/rooms", tags=["student-rooms"])

@router.get("/")
async def list_student_rooms_stub() -> dict:
    return {"items": [], "detail": "student rooms not yet implemented"}

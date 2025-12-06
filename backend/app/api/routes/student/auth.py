from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["student-auth"])

@router.post("/login")
async def student_login_stub() -> dict:
    return {"detail": "student login not yet implemented"}

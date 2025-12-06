from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["dashboard-auth"])

@router.post("/login")
async def dashboard_login_stub() -> dict:
    return {"detail": "dashboard login not yet implemented"}

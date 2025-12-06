from fastapi import APIRouter

router = APIRouter(prefix="/staff", tags=["dashboard-staff"])

@router.get("/")
async def list_dashboard_staff_stub() -> dict:
    return {"items": [], "detail": "staff listing not yet implemented"}

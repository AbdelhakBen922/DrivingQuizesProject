from fastapi import APIRouter

router = APIRouter(prefix="/rooms", tags=["dashboard-rooms"])

@router.get("/")
async def list_dashboard_rooms_stub() -> dict:
    return {"items": [], "detail": "dashboard rooms not yet implemented"}

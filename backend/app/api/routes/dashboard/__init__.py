from fastapi import APIRouter

from app.api.routes.dashboard import auth, rooms, settings, staff, students, templates

router = APIRouter(prefix="/dashboard")
router.include_router(auth.router)
router.include_router(students.router)
router.include_router(staff.router)
router.include_router(rooms.router)
router.include_router(templates.router)
router.include_router(settings.router)

__all__ = [
	"router",
	"auth",
	"students",
	"staff",
	"rooms",
	"settings",
	"templates",
]

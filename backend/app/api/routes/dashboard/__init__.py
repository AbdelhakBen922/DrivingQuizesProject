from fastapi import APIRouter

from app.api.routes.dashboard import auth, quizzes, rooms, staff, students

router = APIRouter(prefix="/dashboard")
router.include_router(auth.router)
router.include_router(students.router)
router.include_router(staff.router)
router.include_router(quizzes.router)
router.include_router(rooms.router)

__all__ = [
	"router",
	"auth",
	"students",
	"staff",
	"quizzes",
	"rooms",
]

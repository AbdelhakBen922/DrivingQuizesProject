from fastapi import APIRouter

from app.api.routes.student import auth, quizzes, rooms

router = APIRouter(prefix="/student")
router.include_router(auth.router)
router.include_router(rooms.router)
router.include_router(quizzes.router)

__all__ = ["router", "auth", "rooms", "quizzes"]

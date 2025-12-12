from fastapi import APIRouter

from app.api.routes.student import auth, dashboard, quiz, quizzes, rooms

router = APIRouter(prefix="/student")
router.include_router(auth.router)
router.include_router(dashboard.router)
router.include_router(quiz.router)
router.include_router(rooms.router)
router.include_router(quizzes.router)

__all__ = ["router", "auth", "dashboard", "quiz", "rooms", "quizzes"]

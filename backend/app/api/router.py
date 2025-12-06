from fastapi import APIRouter

from app.api.routes import dashboard, learning, questions, quizzes, rooms, schools, student, students

api_router = APIRouter()
# api_router.include_router(schools.router)
# api_router.include_router(students.router)
# api_router.include_router(questions.router)
# api_router.include_router(quizzes.router)
# api_router.include_router(rooms.router)
# api_router.include_router(learning.router)
api_router.include_router(dashboard.router)
api_router.include_router(student.router)

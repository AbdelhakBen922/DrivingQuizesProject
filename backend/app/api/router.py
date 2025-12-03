from fastapi import APIRouter

from app.api.routes import quiz_templates, schools, students, template_questions

api_router = APIRouter()
api_router.include_router(schools.router)
api_router.include_router(students.router)
api_router.include_router(quiz_templates.router)
api_router.include_router(template_questions.router)

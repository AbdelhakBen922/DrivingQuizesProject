from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.learning_module import LearningModule
from app.models.learning_module_lesson import LearningModuleLesson
from app.models.learning_progress import LearningProgress
from app.models.school import School
from app.models.staff_user import StaffUser
from app.models.student import Student
from app.schemas.learning_module import LearningModuleCreate, LearningModuleRead, LearningModuleUpdate
from app.schemas.learning_module_lesson import (
    LearningModuleLessonCreate,
    LearningModuleLessonRead,
    LearningModuleLessonUpdate,
)
from app.schemas.learning_progress import (
    LearningProgressCreate,
    LearningProgressRead,
    LearningProgressUpdate,
)

router = APIRouter()


async def _get_school(session: AsyncSession, school_id: int) -> School:
    school = await session.get(School, school_id)
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")
    return school


async def _get_staff(session: AsyncSession, staff_id: int) -> StaffUser:
    staff = await session.get(StaffUser, staff_id)
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff user not found")
    return staff


async def _get_student(session: AsyncSession, student_id: int) -> Student:
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


async def _get_module(session: AsyncSession, module_id: int) -> LearningModule:
    module = await session.get(LearningModule, module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning module not found")
    return module


async def _get_lesson(session: AsyncSession, lesson_id: int) -> LearningModuleLesson:
    lesson = await session.get(LearningModuleLesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning module lesson not found")
    return lesson


async def _get_progress(session: AsyncSession, progress_id: int) -> LearningProgress:
    progress = await session.get(LearningProgress, progress_id)
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning progress not found")
    return progress


@router.post(
    "/learning-modules",
    response_model=LearningModuleRead,
    status_code=status.HTTP_201_CREATED,
    tags=["learning-modules"],
)
async def create_learning_module(
    payload: LearningModuleCreate, session: AsyncSession = Depends(get_db)
) -> LearningModule:
    data = payload.model_dump(exclude_unset=True)

    school_id = data.get("school_id")
    if school_id is not None:
        await _get_school(session, school_id)

    created_by_id = data.get("created_by_id")
    if created_by_id is not None:
        staff = await _get_staff(session, created_by_id)
        if school_id is not None and staff.school_id != school_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff user must belong to the same school",
            )

    module = LearningModule(**data)
    session.add(module)
    await session.commit()
    await session.refresh(module)
    return module


@router.get("/learning-modules", response_model=list[LearningModuleRead], tags=["learning-modules"])
async def list_learning_modules(
    session: AsyncSession = Depends(get_db),
    school_id: int | None = Query(default=None),
) -> list[LearningModule]:
    stmt = select(LearningModule).order_by(LearningModule.created_at.desc())
    if school_id is not None:
        stmt = stmt.where(LearningModule.school_id == school_id)
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get(
    "/learning-modules/{module_id}", response_model=LearningModuleRead, tags=["learning-modules"]
)
async def get_learning_module(module_id: int, session: AsyncSession = Depends(get_db)) -> LearningModule:
    return await _get_module(session, module_id)


@router.patch(
    "/learning-modules/{module_id}", response_model=LearningModuleRead, tags=["learning-modules"]
)
async def update_learning_module(
    module_id: int,
    payload: LearningModuleUpdate,
    session: AsyncSession = Depends(get_db),
) -> LearningModule:
    module = await _get_module(session, module_id)
    data = payload.model_dump(exclude_unset=True)

    school_id = data.get("school_id")
    if school_id is not None:
        await _get_school(session, school_id)

    created_by_id = data.get("created_by_id")
    target_school_id = school_id or module.school_id
    if created_by_id is not None and target_school_id is not None:
        staff = await _get_staff(session, created_by_id)
        if staff.school_id != target_school_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff user must belong to the same school",
            )

    for field, value in data.items():
        setattr(module, field, value)

    await session.commit()
    await session.refresh(module)
    return module


@router.delete(
    "/learning-modules/{module_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={204: {"description": "Deleted"}},
    tags=["learning-modules"],
)
async def delete_learning_module(module_id: int, session: AsyncSession = Depends(get_db)) -> Response:
    module = await _get_module(session, module_id)
    await session.delete(module)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/learning-module-lessons",
    response_model=LearningModuleLessonRead,
    status_code=status.HTTP_201_CREATED,
    tags=["learning-module-lessons"],
)
async def create_learning_module_lesson(
    payload: LearningModuleLessonCreate, session: AsyncSession = Depends(get_db)
) -> LearningModuleLesson:
    data = payload.model_dump(exclude_unset=True)
    await _get_module(session, data["learning_module_id"])

    lesson = LearningModuleLesson(**data)
    session.add(lesson)
    await session.commit()
    await session.refresh(lesson)
    return lesson


@router.get(
    "/learning-module-lessons",
    response_model=list[LearningModuleLessonRead],
    tags=["learning-module-lessons"],
)
async def list_learning_module_lessons(
    session: AsyncSession = Depends(get_db),
    learning_module_id: int | None = Query(default=None),
) -> list[LearningModuleLesson]:
    stmt = select(LearningModuleLesson).order_by(LearningModuleLesson.order_index.asc())
    if learning_module_id is not None:
        stmt = stmt.where(LearningModuleLesson.learning_module_id == learning_module_id)
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get(
    "/learning-module-lessons/{lesson_id}",
    response_model=LearningModuleLessonRead,
    tags=["learning-module-lessons"],
)
async def get_learning_module_lesson(
    lesson_id: int, session: AsyncSession = Depends(get_db)
) -> LearningModuleLesson:
    return await _get_lesson(session, lesson_id)


@router.patch(
    "/learning-module-lessons/{lesson_id}",
    response_model=LearningModuleLessonRead,
    tags=["learning-module-lessons"],
)
async def update_learning_module_lesson(
    lesson_id: int,
    payload: LearningModuleLessonUpdate,
    session: AsyncSession = Depends(get_db),
) -> LearningModuleLesson:
    lesson = await _get_lesson(session, lesson_id)
    data = payload.model_dump(exclude_unset=True)

    new_module_id = data.get("learning_module_id")
    if new_module_id is not None:
        await _get_module(session, new_module_id)

    for field, value in data.items():
        setattr(lesson, field, value)

    await session.commit()
    await session.refresh(lesson)
    return lesson


@router.delete(
    "/learning-module-lessons/{lesson_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["learning-module-lessons"],
)
async def delete_learning_module_lesson(
    lesson_id: int, session: AsyncSession = Depends(get_db)
) -> Response:
    lesson = await _get_lesson(session, lesson_id)
    await session.delete(lesson)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/learning-progress",
    response_model=LearningProgressRead,
    status_code=status.HTTP_201_CREATED,
    tags=["learning-progress"],
)
async def create_learning_progress(
    payload: LearningProgressCreate, session: AsyncSession = Depends(get_db)
) -> LearningProgress:
    data = payload.model_dump(exclude_unset=True)
    student = await _get_student(session, data["student_id"])
    module = await _get_module(session, data["learning_module_id"])

    lesson_id = data.get("lesson_id")
    if lesson_id is not None:
        lesson = await _get_lesson(session, lesson_id)
        if lesson.learning_module_id != module.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lesson must belong to the specified learning module",
            )

    if module.school_id is not None and student.school_id != module.school_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student must belong to the same school as the module",
        )

    progress = LearningProgress(**data)
    session.add(progress)
    await session.commit()
    await session.refresh(progress)
    return progress


@router.get("/learning-progress", response_model=list[LearningProgressRead], tags=["learning-progress"])
async def list_learning_progress(
    session: AsyncSession = Depends(get_db),
    student_id: int | None = Query(default=None),
    learning_module_id: int | None = Query(default=None),
) -> list[LearningProgress]:
    stmt = select(LearningProgress).order_by(LearningProgress.id.desc())
    if student_id is not None:
        stmt = stmt.where(LearningProgress.student_id == student_id)
    if learning_module_id is not None:
        stmt = stmt.where(LearningProgress.learning_module_id == learning_module_id)
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get(
    "/learning-progress/{progress_id}", response_model=LearningProgressRead, tags=["learning-progress"]
)
async def get_learning_progress(progress_id: int, session: AsyncSession = Depends(get_db)) -> LearningProgress:
    return await _get_progress(session, progress_id)


@router.patch(
    "/learning-progress/{progress_id}", response_model=LearningProgressRead, tags=["learning-progress"]
)
async def update_learning_progress(
    progress_id: int,
    payload: LearningProgressUpdate,
    session: AsyncSession = Depends(get_db),
) -> LearningProgress:
    progress = await _get_progress(session, progress_id)
    data = payload.model_dump(exclude_unset=True)

    student_id = data.get("student_id") or progress.student_id
    module_id = data.get("learning_module_id") or progress.learning_module_id

    student = await _get_student(session, student_id)
    module = await _get_module(session, module_id)

    lesson_id = data.get("lesson_id")
    if lesson_id is not None:
        lesson = await _get_lesson(session, lesson_id)
        if lesson.learning_module_id != module.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lesson must belong to the specified learning module",
            )

    if module.school_id is not None and student.school_id != module.school_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student must belong to the same school as the module",
        )

    for field, value in data.items():
        setattr(progress, field, value)

    await session.commit()
    await session.refresh(progress)
    return progress


@router.delete(
    "/learning-progress/{progress_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["learning-progress"]
)
async def delete_learning_progress(progress_id: int, session: AsyncSession = Depends(get_db)) -> Response:
    progress = await _get_progress(session, progress_id)
    await session.delete(progress)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

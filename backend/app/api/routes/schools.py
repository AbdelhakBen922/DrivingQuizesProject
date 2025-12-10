from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.enums import PlanTier
from app.models.plan import Plan
from app.models.school import School
from app.schemas.school import SchoolCreate, SchoolRead, SchoolUpdate

router = APIRouter(prefix="/schools", tags=["schools"])


async def _get_plan_by_id(session: AsyncSession, plan_id: int) -> Plan:
    plan = await session.get(Plan, plan_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan_id")
    return plan


async def _ensure_default_free_plan(session: AsyncSession) -> Plan:
    stmt = select(Plan).where(Plan.name == PlanTier.FREE)
    result = await session.execute(stmt)
    plan = result.scalar_one_or_none()
    if plan:
        return plan

    plan = Plan(
        name=PlanTier.FREE,
        description="Default free plan",
        price_monthly=0,
        max_students=100,
        max_staff_users=5,
        max_rooms=10,
        max_questions_per_quiz=20,
        features={},
        is_active=True,
    )
    session.add(plan)
    await session.flush()
    return plan


@router.post("/", response_model=SchoolRead, status_code=status.HTTP_201_CREATED)
async def create_school(payload: SchoolCreate, session: AsyncSession = Depends(get_db)) -> School:
    data = payload.model_dump(exclude_unset=True)
    plan_id = data.get("plan_id")

    if plan_id:
        await _get_plan_by_id(session, plan_id)
    else:
        plan = await _ensure_default_free_plan(session)
        data["plan_id"] = plan.id

    school = School(**data)
    session.add(school)
    await session.commit()

    result = await session.execute(
        select(School).options(selectinload(School.plan)).where(School.id == school.id)
    )
    return result.scalar_one()


@router.get("/", response_model=list[SchoolRead])
async def list_schools(session: AsyncSession = Depends(get_db)) -> list[School]:
    stmt = select(School).options(selectinload(School.plan)).order_by(School.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().unique().all()


@router.get("/{school_id}", response_model=SchoolRead)
async def get_school(school_id: int, session: AsyncSession = Depends(get_db)) -> School:
    result = await session.execute(
        select(School).options(selectinload(School.plan)).where(School.id == school_id)
    )
    school = result.scalar_one_or_none()
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")
    return school


@router.patch("/{school_id}", response_model=SchoolRead)
async def update_school(
    school_id: int, payload: SchoolUpdate, session: AsyncSession = Depends(get_db)
) -> School:
    school = await session.get(School, school_id)
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")

    data = payload.model_dump(exclude_unset=True)
    plan_id = data.get("plan_id")
    if plan_id is not None:
        await _get_plan_by_id(session, plan_id)

    for field, value in data.items():
        setattr(school, field, value)

    await session.commit()
    result = await session.execute(
        select(School).options(selectinload(School.plan)).where(School.id == school.id)
    )
    return result.scalar_one()


@router.delete("/{school_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_school(school_id: int, session: AsyncSession = Depends(get_db)) -> Response:
    school = await session.get(School, school_id)
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")

    await session.delete(school)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

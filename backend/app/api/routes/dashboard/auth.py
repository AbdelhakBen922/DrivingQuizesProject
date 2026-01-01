from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.enums import StaffRole
from app.models.school import School
from app.models.staff_user import StaffUser
from app.schemas.auth import StaffLoginRequest, Token
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["dashboard-auth"])


class RegisterRequest(BaseModel):
    school_name: str
    owner_name: str
    email: EmailStr
    phone: str
    password: str


@router.post("/login", response_model=Token)
async def dashboard_login(payload: StaffLoginRequest, session: AsyncSession = Depends(get_db)) -> Token:
    staff = await auth_service.authenticate_staff(session, payload.email, payload.password)
    token = await auth_service.create_staff_token(staff)
    return Token(access_token=token)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def dashboard_register(payload: RegisterRequest, session: AsyncSession = Depends(get_db)) -> dict:
    """Register a new school with owner account"""
    # Check if email already exists
    existing = await session.execute(
        select(StaffUser).where(StaffUser.email == payload.email)
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create school
    school = School(
        name=payload.school_name,
        email=payload.email,
        phone=payload.phone,
        password="",  # Empty password for school
    )
    session.add(school)
    await session.flush()  # Get school ID
    
    # Parse owner name
    name_parts = payload.owner_name.strip().split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    
    # Create owner staff user
    owner = StaffUser(
        school_id=school.id,
        name=payload.owner_name,
        first_name=first_name,
        last_name=last_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
        role=StaffRole.OWNER,
        is_active=True,
    )
    session.add(owner)
    await session.commit()
    
    return {"message": "Registration successful"}


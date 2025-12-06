from fastapi import Depends

from app.core.database import get_db

async def get_current_staff(db=Depends(get_db)):
    raise NotImplementedError("Staff auth dependency not yet implemented")

async def get_current_student(db=Depends(get_db)):
    raise NotImplementedError("Student auth dependency not yet implemented")

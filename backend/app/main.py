from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.router import api_router
from app.core.config import settings
from app.core.database import get_db

app = FastAPI(title=settings.app_name)
app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health_check(session: AsyncSession = Depends(get_db)):
    """Health endpoint that validates DB connectivity."""
    await session.execute(text("SELECT 1"))
    return {"status": "ok"}

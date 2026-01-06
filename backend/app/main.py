from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from pathlib import Path

from app.api.router import api_router
from app.core.config import settings
from app.core.database import get_db

app = FastAPI(title=settings.app_name)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

# Mount static files for quiz images
data_path = Path(settings.data_dir_path)
if data_path.exists():
    app.mount("/data", StaticFiles(directory=str(data_path)), name="data")

# Mount static files for uploads (avatars, etc.)
uploads_path = Path(settings.uploads_dir_path)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")


@app.get("/health")
async def health_check(session: AsyncSession = Depends(get_db)):
    """Health endpoint that validates DB connectivity."""
    await session.execute(text("SELECT 1"))
    return {"status": "ok"}

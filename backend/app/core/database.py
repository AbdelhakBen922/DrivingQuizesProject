from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings


def _build_async_url(database_url: str) -> str:
    """Convert postgresql:// to postgresql+psycopg:// for async psycopg driver."""
    if database_url.startswith("postgresql+psycopg://"):
        return database_url
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


ASYNC_DATABASE_URL = _build_async_url(settings.database_url)

# psycopg3 async driver works with Leapcell's connection pooler
# Use NullPool to avoid connection pooling issues with external poolers
connect_args = {
    "prepare_threshold": None,  # Disable prepared statements (incompatible with some poolers)
}

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=False,
    future=True,
    poolclass=NullPool,  # Let Leapcell handle connection pooling
    connect_args=connect_args,
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an AsyncSession."""
    async with AsyncSessionLocal() as session:
        yield session

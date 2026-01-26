from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import AsyncAdaptedQueuePool

from app.core.config import settings


def _build_async_url(database_url: str) -> str:
    """Convert postgresql:// URL to use psycopg async driver.
    
    psycopg (v3) async is the only driver that works with Leapcell's connection pooler.
    Format: postgresql+psycopg://user:pass@host:port/db?sslmode=require&options=-csearch_path=schema
    """
    # Already has psycopg driver specified
    if "postgresql+psycopg://" in database_url:
        return database_url
    
    # Convert postgresql:// to postgresql+psycopg://
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    
    return database_url


ASYNC_DATABASE_URL = _build_async_url(settings.database_url)

# psycopg3 async configuration for Leapcell compatibility:
# - prepare_threshold=None: Disable prepared statements (incompatible with poolers like PgBouncer/Leapcell)
connect_args = {
    "prepare_threshold": None,  # Critical: Disables prepared statements
}

# Use connection pooling to reuse connections and avoid per-request connection overhead
# pool_size: Number of permanent connections to keep
# max_overflow: Additional connections allowed during peak load
# pool_pre_ping: Verify connection health before use (handles stale connections)
# pool_recycle: Recreate connections after 1800 seconds to avoid stale connections
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=False,
    future=True,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=1800,
    connect_args=connect_args,
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an AsyncSession."""
    async with AsyncSessionLocal() as session:
        yield session

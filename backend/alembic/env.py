from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import Base and all models
from app.models.base import Base
from app.models import *  # noqa - Import all models to register them

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the target metadata for autogenerate
target_metadata = Base.metadata


def get_url():
    """Get database URL from environment variable.
    
    Alembic requires a synchronous driver (psycopg2), not asyncpg.
    Convert postgresql+asyncpg:// to postgresql:// for migrations.
    """
    url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/drivingquiz")
    # Replace asyncpg with psycopg2 for synchronous Alembic migrations
    if "+asyncpg" in url:
        url = url.replace("+asyncpg", "")
    return url


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Get URL from environment
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

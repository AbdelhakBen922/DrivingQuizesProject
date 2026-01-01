"""placeholder revision to restore chain

Revision ID: f6c3b4c9d8a1
Revises: 1a4649b2a14f
Create Date: 2025-12-12 00:00:00.000000

This revision was missing from the repository. It intentionally makes no
schema changes and serves only to bridge the migration chain so later
revisions can apply.
"""
from typing import Sequence, Union

from alembic import op  # noqa: F401
import sqlalchemy as sa  # noqa: F401

# revision identifiers, used by Alembic.
revision: str = "f6c3b4c9d8a1"
down_revision: Union[str, None] = "1a4649b2a14f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # No-op placeholder
    pass


def downgrade() -> None:
    # No-op placeholder
    pass

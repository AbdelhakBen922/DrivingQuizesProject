"""add first last and avatar to staff_user

Revision ID: 3c1e7a4d9b2f
Revises: 2a7b5e1a4b6c
Create Date: 2025-12-10 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3c1e7a4d9b2f"
down_revision: Union[str, None] = "2a7b5e1a4b6c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("staff_user", sa.Column("first_name", sa.String(length=255), nullable=True))
    op.add_column("staff_user", sa.Column("last_name", sa.String(length=255), nullable=True))
    op.add_column("staff_user", sa.Column("avatar_url", sa.String(length=255), nullable=True))
    op.execute(
        """
        UPDATE staff_user
        SET first_name = NULLIF(split_part(COALESCE(name, ''), ' ', 1), ''),
            last_name = NULLIF(split_part(COALESCE(name, ''), ' ', 2), '')
        WHERE name IS NOT NULL
        """
    )


def downgrade() -> None:
    op.drop_column("staff_user", "avatar_url")
    op.drop_column("staff_user", "last_name")
    op.drop_column("staff_user", "first_name")

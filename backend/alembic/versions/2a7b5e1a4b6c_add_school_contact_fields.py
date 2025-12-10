"""add address and phone to school

Revision ID: 2a7b5e1a4b6c
Revises: 1df0b6f3e2c4
Create Date: 2025-12-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2a7b5e1a4b6c"
down_revision: Union[str, None] = "1df0b6f3e2c4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("school", sa.Column("address", sa.String(length=255), nullable=True))
    op.add_column("school", sa.Column("phone", sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column("school", "phone")
    op.drop_column("school", "address")

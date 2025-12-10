"""drop duration column from quizze

Revision ID: f6c3b4c9d8a1
Revises: e1e4fcd0b470
Create Date: 2025-12-09 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f6c3b4c9d8a1"
down_revision: Union[str, None] = "e1e4fcd0b470"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("quizze", "duration_minutes")


def downgrade() -> None:
    op.add_column("quizze", sa.Column("duration_minutes", sa.Integer(), nullable=True))

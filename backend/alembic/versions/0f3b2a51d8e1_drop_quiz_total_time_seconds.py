"""drop quiz total time seconds

Revision ID: 0f3b2a51d8e1
Revises: 6bf88d3c005d
Create Date: 2025-12-06 15:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0f3b2a51d8e1"
down_revision: Union[str, None] = "6bf88d3c005d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("quizze", "total_time_seconds")


def downgrade() -> None:
    op.add_column(
        "quizze",
        sa.Column("total_time_seconds", sa.Integer(), nullable=True),
    )

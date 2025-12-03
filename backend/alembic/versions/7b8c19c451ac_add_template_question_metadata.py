"""add template question metadata

Revision ID: 7b8c19c451ac
Revises: 81d89b3def99
Create Date: 2025-11-30 18:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7b8c19c451ac"
down_revision: Union[str, None] = "ef1549aace2e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "quiz_template_questions",
        sa.Column("is_required", sa.Boolean(), server_default=sa.text("true"), nullable=False),
    )
    op.add_column(
        "quiz_template_questions",
        sa.Column("randomize_options", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    op.add_column(
        "quiz_template_questions",
        sa.Column("estimation_time_seconds", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("quiz_template_questions", "estimation_time_seconds")
    op.drop_column("quiz_template_questions", "randomize_options")
    op.drop_column("quiz_template_questions", "is_required")

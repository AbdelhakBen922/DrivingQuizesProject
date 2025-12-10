"""add topic and difficulty to quiz templates

Revision ID: d3b8f60f5e5e
Revises: c98b3f1f1c4d
Create Date: 2025-12-09 11:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d3b8f60f5e5e"
down_revision: Union[str, None] = "c98b3f1f1c4d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("quiz_template", sa.Column("topic_id", sa.Integer(), nullable=True))
    op.add_column(
        "quiz_template",
        sa.Column(
            "difficulty",
            sa.Enum("easy", "medium", "hard", name="question_difficulty_enum"),
            nullable=False,
            server_default=sa.text("'medium'"),
        ),
    )


def downgrade() -> None:
    op.drop_column("quiz_template", "difficulty")
    op.drop_column("quiz_template", "topic_id")

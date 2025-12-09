"""scope templates by school and add quiz timing fields

Revision ID: e1e4fcd0b470
Revises: d3b8f60f5e5e
Create Date: 2025-12-09 12:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e1e4fcd0b470"
down_revision: Union[str, None] = "d3b8f60f5e5e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("quiz_template", sa.Column("school_id", sa.BigInteger(), nullable=True))
    op.create_index("ix_quiz_template_school", "quiz_template", ["school_id"], unique=False)
    op.create_foreign_key(
        "quiz_template_school_id_fkey",
        "quiz_template",
        "school",
        ["school_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.add_column("quizze", sa.Column("duration_minutes", sa.Integer(), nullable=True))
    op.add_column(
        "quizze",
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "quizze",
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("quizze", "ends_at")
    op.drop_column("quizze", "starts_at")
    op.drop_column("quizze", "duration_minutes")

    op.drop_constraint("quiz_template_school_id_fkey", "quiz_template", type_="foreignkey")
    op.drop_index("ix_quiz_template_school", table_name="quiz_template")
    op.drop_column("quiz_template", "school_id")

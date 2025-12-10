"""drop quiz_question table

Revision ID: 1df0b6f3e2c4
Revises: f6c3b4c9d8a1
Create Date: 2025-12-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1df0b6f3e2c4"
down_revision: Union[str, None] = "f6c3b4c9d8a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table("quiz_question")


def downgrade() -> None:
    op.create_table(
        "quiz_question",
        sa.Column("quiz_id", sa.BigInteger(), nullable=False),
        sa.Column("question_id", sa.BigInteger(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=True),
        sa.Column("duration_sec", sa.Integer(), server_default=sa.text("30"), nullable=False),
        sa.Column("is_required", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["question.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["quiz_id"], ["quizze.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("uq_quiz_question", "quiz_question", ["quiz_id", "question_id"], unique=True)

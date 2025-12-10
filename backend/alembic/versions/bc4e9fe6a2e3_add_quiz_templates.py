"""add quiz template support

Revision ID: bc4e9fe6a2e3
Revises: 0f3b2a51d8e1
Create Date: 2025-12-09 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "bc4e9fe6a2e3"
down_revision: Union[str, None] = "0f3b2a51d8e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "quiz_template",
        sa.Column("school_id", sa.BigInteger(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("default_duration_sec", sa.Integer(), nullable=True),
        sa.Column(
            "settings",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_by_id", sa.BigInteger(), nullable=True),
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["created_by_id"], ["staff_user.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["school_id"], ["school.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_quiz_template_school", "quiz_template", ["school_id"], unique=False)

    op.create_table(
        "quiz_template_question",
        sa.Column("template_id", sa.BigInteger(), nullable=False),
        sa.Column("question_id", sa.BigInteger(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=True),
        sa.Column("duration_sec", sa.Integer(), nullable=True),
        sa.Column("is_required", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("randomize_options", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("estimation_time_seconds", sa.Integer(), nullable=True),
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["question.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["template_id"], ["quiz_template.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("template_id", "question_id", name="uq_quiz_template_question"),
    )

    op.add_column("quizze", sa.Column("template_id", sa.BigInteger(), nullable=True))
    op.create_foreign_key(
        "quizze_template_id_fkey",
        "quizze",
        "quiz_template",
        ["template_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("quizze_template_id_fkey", "quizze", type_="foreignkey")
    op.drop_column("quizze", "template_id")

    op.drop_table("quiz_template_question")
    op.drop_index("ix_quiz_template_school", table_name="quiz_template")
    op.drop_table("quiz_template")

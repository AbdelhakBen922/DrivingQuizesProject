"""enforce localized quiz titles

Revision ID: 4f1b54d6a2fa
Revises: 2ed46a0b4ea7
Create Date: 2025-12-12 00:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4f1b54d6a2fa"
down_revision: Union[str, None] = "2ed46a0b4ea7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            "UPDATE quizze SET title_ar = COALESCE(title_ar, title), title_fr = COALESCE(title_fr, title)"
        )
    )
    op.alter_column(
        "quizze",
        "title_ar",
        existing_type=sa.String(length=255),
        nullable=False,
    )
    op.alter_column(
        "quizze",
        "title_fr",
        existing_type=sa.String(length=255),
        nullable=False,
    )
    op.drop_column("quizze", "title")


def downgrade() -> None:
    op.add_column(
        "quizze",
        sa.Column("title", sa.String(length=255), nullable=False, server_default=""),
    )
    op.execute(
        sa.text(
            "UPDATE quizze SET title = COALESCE(title_fr, title_ar, '')"
        )
    )
    op.alter_column(
        "quizze",
        "title_fr",
        existing_type=sa.String(length=255),
        nullable=True,
    )
    op.alter_column(
        "quizze",
        "title_ar",
        existing_type=sa.String(length=255),
        nullable=True,
    )
    op.alter_column("quizze", "title", server_default=None)

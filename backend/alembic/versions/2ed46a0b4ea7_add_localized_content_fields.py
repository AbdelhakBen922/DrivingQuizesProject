"""add localized content fields

Revision ID: 2ed46a0b4ea7
Revises: f6c3b4c9d8a1
Create Date: 2025-12-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2ed46a0b4ea7"
down_revision: Union[str, None] = "f6c3b4c9d8a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Question text localization
    op.add_column(
        "question",
        sa.Column("text_ar", sa.Text(), nullable=False, server_default=sa.text("''")),
    )
    op.add_column(
        "question",
        sa.Column("text_fr", sa.Text(), nullable=False, server_default=sa.text("''")),
    )
    op.execute(sa.text("UPDATE question SET text_ar = text, text_fr = text"))
    op.alter_column("question", "text_ar", server_default=None)
    op.alter_column("question", "text_fr", server_default=None)
    op.drop_column("question", "text")

    # Choice text localization
    op.add_column(
        "choice",
        sa.Column("text_ar", sa.Text(), nullable=False, server_default=sa.text("''")),
    )
    op.add_column(
        "choice",
        sa.Column("text_fr", sa.Text(), nullable=False, server_default=sa.text("''")),
    )
    op.execute(sa.text("UPDATE choice SET text_ar = text, text_fr = text"))
    op.alter_column("choice", "text_ar", server_default=None)
    op.alter_column("choice", "text_fr", server_default=None)
    op.drop_column("choice", "text")

    # Quiz template localized metadata
    op.add_column("quiz_template", sa.Column("title_ar", sa.String(length=255), nullable=True))
    op.add_column("quiz_template", sa.Column("title_fr", sa.String(length=255), nullable=True))
    op.add_column("quiz_template", sa.Column("description_ar", sa.Text(), nullable=True))
    op.add_column("quiz_template", sa.Column("description_fr", sa.Text(), nullable=True))

    # Quiz localized titles
    op.add_column("quizze", sa.Column("title_ar", sa.String(length=255), nullable=True))
    op.add_column("quizze", sa.Column("title_fr", sa.String(length=255), nullable=True))
    op.execute(sa.text("UPDATE quizze SET title_ar = title, title_fr = title"))


def downgrade() -> None:
    # Quiz localized titles
    op.drop_column("quizze", "title_fr")
    op.drop_column("quizze", "title_ar")

    # Quiz template localized metadata
    op.drop_column("quiz_template", "description_fr")
    op.drop_column("quiz_template", "description_ar")
    op.drop_column("quiz_template", "title_fr")
    op.drop_column("quiz_template", "title_ar")

    # Choice text localization
    op.add_column(
        "choice",
        sa.Column("text", sa.Text(), nullable=False, server_default=sa.text("''")),
    )
    op.execute(sa.text("UPDATE choice SET text = COALESCE(text_ar, text_fr, '')"))
    op.alter_column("choice", "text", server_default=None)
    op.drop_column("choice", "text_fr")
    op.drop_column("choice", "text_ar")

    # Question text localization
    op.add_column(
        "question",
        sa.Column("text", sa.Text(), nullable=False, server_default=sa.text("''")),
    )
    op.execute(sa.text("UPDATE question SET text = COALESCE(text_ar, text_fr, '')"))
    op.alter_column("question", "text", server_default=None)
    op.drop_column("question", "text_fr")
    op.drop_column("question", "text_ar")

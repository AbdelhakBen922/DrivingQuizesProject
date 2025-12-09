"""drop school link from quiz templates

Revision ID: c98b3f1f1c4d
Revises: bc4e9fe6a2e3
Create Date: 2025-12-09 10:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c98b3f1f1c4d"
down_revision: Union[str, None] = "bc4e9fe6a2e3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("quiz_template_school_id_fkey", "quiz_template", type_="foreignkey")
    op.drop_index("ix_quiz_template_school", table_name="quiz_template")
    op.drop_column("quiz_template", "school_id")


def downgrade() -> None:
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

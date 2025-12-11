"""change_image_url_to_text

Revision ID: 1a4649b2a14f
Revises: c20e62c4b552
Create Date: 2025-12-11 11:18:11.761608

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1a4649b2a14f'
down_revision: Union[str, None] = 'c20e62c4b552'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Change image_url column from VARCHAR(255) to TEXT
    op.alter_column('question', 'image_url',
                    existing_type=sa.VARCHAR(length=255),
                    type_=sa.Text(),
                    existing_nullable=True)


def downgrade() -> None:
    # Revert image_url column back to VARCHAR(255)
    op.alter_column('question', 'image_url',
                    existing_type=sa.Text(),
                    type_=sa.VARCHAR(length=255),
                    existing_nullable=True)

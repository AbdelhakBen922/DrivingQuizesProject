"""init

Revision ID: ab4ddc8f48f7
Revises: 81d89b3def99
Create Date: 2025-11-30 15:15:46.776052

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab4ddc8f48f7'
down_revision: Union[str, None] = '81d89b3def99'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

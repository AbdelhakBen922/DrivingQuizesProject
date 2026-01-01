"""init

Revision ID: 2f0869f1681c
Revises: 737f7bb35473
Create Date: 2025-12-11 00:40:29.194111

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2f0869f1681c'
down_revision: Union[str, None] = '737f7bb35473'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

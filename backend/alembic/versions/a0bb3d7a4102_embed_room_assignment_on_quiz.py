"""embed room assignment on quiz

Revision ID: a0bb3d7a4102
Revises: 3c1e7a4d9b2f
Create Date: 2025-12-10 09:40:45.954402

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'a0bb3d7a4102'
down_revision: Union[str, None] = '3c1e7a4d9b2f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("quizze", sa.Column("room_id", sa.BigInteger(), nullable=True))
    op.create_foreign_key(
        "fk_quizze_room_id_room",
        "quizze",
        "room",
        ["room_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.execute(
        """
        UPDATE quizze AS q
        SET room_id = rq.room_id
        FROM (
            SELECT DISTINCT ON (quiz_id) quiz_id, room_id
            FROM room_quizze
            ORDER BY quiz_id, id
        ) AS rq
        WHERE q.id = rq.quiz_id
        """
    )

    op.drop_index("uq_room_quiz", table_name="room_quizze")
    op.drop_table("room_quizze")
    op.execute("DROP TYPE IF EXISTS quiz_status_enum")


def downgrade() -> None:
    quiz_status_enum = sa.Enum("active", "closed", "scheduled", name="quiz_status_enum")
    op.create_table(
        "room_quizze",
        sa.Column("room_id", sa.BigInteger(), nullable=False),
        sa.Column("quiz_id", sa.BigInteger(), nullable=False),
        sa.Column(
            "instance_settings",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column(
            "published_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=True,
        ),
        sa.Column(
            "status",
            quiz_status_enum,
            server_default=sa.text("'active'"),
            nullable=False,
        ),
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.ForeignKeyConstraint(["quiz_id"], ["quizze.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["room_id"], ["room.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("uq_room_quiz", "room_quizze", ["room_id", "quiz_id"], unique=True)

    op.execute(
        """
        INSERT INTO room_quizze (room_id, quiz_id, instance_settings, status)
        SELECT room_id, id, '{}'::jsonb, 'active'
        FROM quizze
        WHERE room_id IS NOT NULL
        """
    )

    op.drop_constraint("fk_quizze_room_id_room", "quizze", type_="foreignkey")
    op.drop_column("quizze", "room_id")

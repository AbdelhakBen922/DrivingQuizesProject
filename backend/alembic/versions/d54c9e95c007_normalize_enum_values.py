"""normalize enum values to lowercase

Revision ID: d54c9e95c007
Revises: 7b8c19c451ac
Create Date: 2025-11-30 22:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "d54c9e95c007"
down_revision: Union[str, None] = "7b8c19c451ac"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_LOWERCASE_RENAMES = [
    ("staff_role", "OWNER", "owner"),
    ("staff_role", "ADMIN", "admin"),
    ("staff_role", "INSTRUCTOR", "instructor"),
    ("staff_role", "SECRETARY", "secretary"),
    ("plan_tier", "FREE", "free"),
    ("plan_tier", "BASIC", "basic"),
    ("plan_tier", "PREMIUM", "premium"),
    ("question_difficulty", "EASY", "easy"),
    ("question_difficulty", "MEDIUM", "medium"),
    ("question_difficulty", "HARD", "hard"),
    ("quiz_attempt_status", "IN_PROGRESS", "in_progress"),
    ("quiz_attempt_status", "SUBMITTED", "submitted"),
    ("quiz_attempt_status", "GRADED", "graded"),
    ("room_membership_status", "ACTIVE", "active"),
    ("room_membership_status", "REMOVED", "removed"),
    ("audit_actor_type", "SCHOOL_STAFF", "school_staff"),
    ("audit_actor_type", "SYSTEM", "system"),
    ("audit_actor_type", "API", "api"),
    ("ocr_job_status", "PENDING", "pending"),
    ("ocr_job_status", "PROCESSING", "processing"),
    ("ocr_job_status", "COMPLETED", "completed"),
    ("ocr_job_status", "FAILED", "failed"),
    ("ai_analysis_status", "PENDING", "pending"),
    ("ai_analysis_status", "PROCESSING", "processing"),
    ("ai_analysis_status", "COMPLETED", "completed"),
    ("ai_analysis_status", "FAILED", "failed"),
    ("notification_recipient", "STUDENT", "student"),
    ("notification_recipient", "STAFF", "staff"),
    ("notification_recipient", "SYSTEM", "system"),
]

_UPPERCASE_RENAMES = [
    (enum_name, new_value, old_value) for enum_name, old_value, new_value in _LOWERCASE_RENAMES
]


def _rename_enum_value(enum_name: str, old_value: str, new_value: str) -> None:
    sql = """
DO $$
DECLARE
    enum_name text := :enum_name;
    old_value text := :old_value;
    new_value text := :new_value;
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = enum_name AND e.enumlabel = old_value
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = enum_name AND e.enumlabel = new_value
    ) THEN
        EXECUTE format('ALTER TYPE %I RENAME VALUE %L TO %L', enum_name, old_value, new_value);
    END IF;
END$$;
    """
    op.execute(sa.text(sql).bindparams(enum_name=enum_name, old_value=old_value, new_value=new_value))


def _apply_renames(pairs: list[tuple[str, str, str]]) -> None:
    for enum_name, from_value, to_value in pairs:
        _rename_enum_value(enum_name, from_value, to_value)



def upgrade() -> None:
    _apply_renames(_LOWERCASE_RENAMES)



def downgrade() -> None:
    _apply_renames(_UPPERCASE_RENAMES)

"""initial schema: patients and notes

Revision ID: 0001
Revises:
Create Date: 2026-11-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

patient_status = postgresql.ENUM(
    "active", "inactive", "critical", name="patient_status", create_type=False
)


def upgrade() -> None:
    patient_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(50), nullable=False),
        sa.Column("address", sa.String(500), nullable=False),
        sa.Column("blood_type", sa.String(3), nullable=False),
        sa.Column("allergies", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("conditions", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("status", patient_status, nullable=False),
        sa.Column("last_visit", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_patients_first_name", "patients", ["first_name"])
    op.create_index("ix_patients_last_name", "patients", ["last_name"])
    op.create_index("ix_patients_status", "patients", ["status"])

    op.create_table(
        "notes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_notes_patient_id", "notes", ["patient_id"])


def downgrade() -> None:
    op.drop_table("notes")
    op.drop_table("patients")
    patient_status.drop(op.get_bind(), checkfirst=True)

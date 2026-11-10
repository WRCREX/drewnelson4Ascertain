import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class PatientStatus(str, enum.Enum):
    """Clinical status drives list filtering and dashboard rollups."""

    active = "active"
    inactive = "inactive"
    critical = "critical"


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100), index=True)
    last_name: Mapped[str] = mapped_column(String(100), index=True)
    date_of_birth: Mapped[date] = mapped_column(Date)
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(50))
    address: Mapped[str] = mapped_column(String(500))
    blood_type: Mapped[str] = mapped_column(String(3))
    allergies: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    conditions: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    status: Mapped[PatientStatus] = mapped_column(
        Enum(PatientStatus, name="patient_status"), default=PatientStatus.active, index=True
    )
    last_visit: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    notes: Mapped[list["Note"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan", order_by="Note.created_at.desc()"
    )

    @property
    def age(self) -> int:
        """Age computed server-side so every client agrees on it."""
        today = date.today()
        years = today.year - self.date_of_birth.year
        if (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day):
            years -= 1
        return years


from app.models.note import Note

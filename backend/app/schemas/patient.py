from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.patient import PatientStatus

BLOOD_TYPES = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}


class PatientBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    date_of_birth: date
    email: EmailStr
    phone: str = Field(min_length=7, max_length=50)
    address: str = Field(min_length=1, max_length=500)
    blood_type: str
    allergies: list[str] = []
    conditions: list[str] = []
    status: PatientStatus = PatientStatus.active
    last_visit: datetime | None = None

    @field_validator("blood_type")
    @classmethod
    def validate_blood_type(cls, v: str) -> str:
        if v not in BLOOD_TYPES:
            raise ValueError(f"blood_type must be one of {sorted(BLOOD_TYPES)}")
        return v

    @field_validator("date_of_birth")
    @classmethod
    def dob_not_in_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("date_of_birth cannot be in the future")
        return v


class PatientCreate(PatientBase):
    pass


class PatientUpdate(PatientBase):
    pass


class PatientRead(PatientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    age: int
    created_at: datetime
    updated_at: datetime


class PatientPage(BaseModel):
    """Paginated envelope so the client gets totals without a second request."""

    items: list[PatientRead]
    total: int
    page: int
    page_size: int
    pages: int

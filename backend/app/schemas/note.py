from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NoteCreate(BaseModel):
    content: str = Field(min_length=1, max_length=10000)
    created_at: datetime | None = None


class NoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    content: str
    created_at: datetime


class PatientSummary(BaseModel):
    patient_id: int
    name: str
    age: int
    blood_type: str
    conditions: list[str]
    allergies: list[str]
    narrative: str

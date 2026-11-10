from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import Patient, PatientStatus
from app.repositories.notes import NoteRepository
from app.repositories.patients import SORTABLE, PatientRepository
from app.schemas.note import NoteCreate, NoteRead, PatientSummary
from app.schemas.patient import PatientCreate, PatientPage, PatientRead, PatientUpdate
from app.services.summary import build_summary

router = APIRouter(prefix="/patients", tags=["patients"])


async def get_patient_or_404(patient_id: int, db: AsyncSession = Depends(get_db)) -> Patient:
    """Shared dependency: every /patients/{id} route 404s consistently."""
    patient = await PatientRepository(db).get(patient_id)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


@router.get("", response_model=PatientPage)
async def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, max_length=200),
    status_filter: PatientStatus | None = Query(None, alias="status"),
    sort_by: str = Query("last_name", pattern=f"^({'|'.join(SORTABLE)})$"),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db),
) -> PatientPage:
    items, total = await PatientRepository(db).list(
        page=page,
        page_size=page_size,
        search=search,
        status=status_filter,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    pages = max(1, -(-total // page_size))
    return PatientPage(
        items=[PatientRead.model_validate(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.post("", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
async def create_patient(payload: PatientCreate, db: AsyncSession = Depends(get_db)) -> Patient:
    return await PatientRepository(db).create(payload.model_dump())


@router.get("/{patient_id}", response_model=PatientRead)
async def get_patient(patient: Patient = Depends(get_patient_or_404)) -> Patient:
    return patient


@router.put("/{patient_id}", response_model=PatientRead)
async def update_patient(
    payload: PatientUpdate,
    patient: Patient = Depends(get_patient_or_404),
    db: AsyncSession = Depends(get_db),
) -> Patient:
    return await PatientRepository(db).update(patient, payload.model_dump())


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient: Patient = Depends(get_patient_or_404), db: AsyncSession = Depends(get_db)
) -> None:
    await PatientRepository(db).delete(patient)


@router.get("/{patient_id}/notes", response_model=list[NoteRead])
async def list_notes(
    patient: Patient = Depends(get_patient_or_404), db: AsyncSession = Depends(get_db)
):
    return await NoteRepository(db).list_for_patient(patient.id)


@router.post("/{patient_id}/notes", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
async def create_note(
    payload: NoteCreate,
    patient: Patient = Depends(get_patient_or_404),
    db: AsyncSession = Depends(get_db),
):
    return await NoteRepository(db).create(patient.id, payload.content, payload.created_at)


@router.delete("/{patient_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    patient: Patient = Depends(get_patient_or_404),
    db: AsyncSession = Depends(get_db),
) -> None:
    repo = NoteRepository(db)
    note = await repo.get(note_id)
    if note is None or note.patient_id != patient.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    await repo.delete(note)


@router.get("/{patient_id}/summary", response_model=PatientSummary)
async def patient_summary(
    patient: Patient = Depends(get_patient_or_404), db: AsyncSession = Depends(get_db)
) -> PatientSummary:
    notes = await NoteRepository(db).list_for_patient(patient.id)
    return build_summary(patient, notes)

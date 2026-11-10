from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Note


class NoteRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_for_patient(self, patient_id: int) -> list[Note]:
        rows = await self.db.scalars(
            select(Note).where(Note.patient_id == patient_id).order_by(Note.created_at.desc())
        )
        return list(rows)

    async def get(self, note_id: int) -> Note | None:
        return await self.db.get(Note, note_id)

    async def create(self, patient_id: int, content: str, created_at=None) -> Note:
        note = Note(patient_id=patient_id, content=content)
        if created_at is not None:
            note.created_at = created_at
        self.db.add(note)
        await self.db.commit()
        await self.db.refresh(note)
        return note

    async def delete(self, note: Note) -> None:
        await self.db.delete(note)
        await self.db.commit()

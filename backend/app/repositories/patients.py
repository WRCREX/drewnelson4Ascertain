from sqlalchemy import Select, asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Patient, PatientStatus

SORTABLE = {
    "last_name": Patient.last_name,
    "first_name": Patient.first_name,
    "last_visit": Patient.last_visit,
    "status": Patient.status,
    "date_of_birth": Patient.date_of_birth,
    "created_at": Patient.created_at,
}


class PatientRepository:
    """All patient persistence lives here so routes stay orchestration-only."""

    def __init__(self, db: AsyncSession):
        self.db = db

    def _apply_filters(
        self, stmt: Select, search: str | None, status: PatientStatus | None
    ) -> Select:
        if search:
            like = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Patient.first_name.ilike(like),
                    Patient.last_name.ilike(like),
                    func.concat(Patient.first_name, " ", Patient.last_name).ilike(like),
                    Patient.email.ilike(like),
                )
            )
        if status:
            stmt = stmt.where(Patient.status == status)
        return stmt

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        status: PatientStatus | None = None,
        sort_by: str = "last_name",
        sort_dir: str = "asc",
    ) -> tuple[list[Patient], int]:
        col = SORTABLE.get(sort_by, Patient.last_name)
        order = asc(col) if sort_dir == "asc" else desc(col)

        base = self._apply_filters(select(Patient), search, status)
        total = await self.db.scalar(
            select(func.count()).select_from(base.subquery())
        )
        rows = await self.db.scalars(
            base.order_by(order, Patient.id).offset((page - 1) * page_size).limit(page_size)
        )
        return list(rows), int(total or 0)

    async def get(self, patient_id: int) -> Patient | None:
        return await self.db.get(Patient, patient_id)

    async def create(self, data: dict) -> Patient:
        patient = Patient(**data)
        self.db.add(patient)
        await self.db.commit()
        await self.db.refresh(patient)
        return patient

    async def update(self, patient: Patient, data: dict) -> Patient:
        for key, value in data.items():
            setattr(patient, key, value)
        await self.db.commit()
        await self.db.refresh(patient)
        return patient

    async def delete(self, patient: Patient) -> None:
        await self.db.delete(patient)
        await self.db.commit()

    async def count(self) -> int:
        return int(await self.db.scalar(select(func.count(Patient.id))) or 0)

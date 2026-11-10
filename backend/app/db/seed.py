from datetime import date, datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Note, Patient, PatientStatus
from app.repositories.patients import PatientRepository

SEED_PATIENTS = [
    ("Maria", "Gonzalez", date(1958, 3, 14), "O+", ["Penicillin"], ["Type 2 Diabetes", "Hypertension"], PatientStatus.active),
    ("James", "Whitfield", date(1972, 7, 2), "A-", [], ["Hyperlipidemia"], PatientStatus.active),
    ("Aisha", "Okafor", date(1990, 11, 23), "B+", ["Latex"], ["Asthma"], PatientStatus.active),
    ("Chen", "Wei", date(1985, 1, 9), "AB+", [], [], PatientStatus.active),
    ("Robert", "Kaminski", date(1949, 5, 30), "O-", ["Sulfa drugs"], ["COPD", "Atrial Fibrillation"], PatientStatus.critical),
    ("Linda", "Petersen", date(1964, 9, 17), "A+", ["Aspirin"], ["Osteoarthritis"], PatientStatus.active),
    ("Devon", "Marsh", date(1998, 2, 5), "B-", [], ["Anxiety Disorder"], PatientStatus.active),
    ("Fatima", "Al-Rashid", date(1979, 12, 1), "O+", ["Shellfish"], ["Migraine"], PatientStatus.active),
    ("Thomas", "Nguyen", date(1955, 8, 21), "A+", [], ["Chronic Kidney Disease", "Hypertension"], PatientStatus.critical),
    ("Sarah", "Lindqvist", date(1988, 4, 12), "AB-", ["Peanuts"], [], PatientStatus.active),
    ("Marcus", "Bell", date(1969, 6, 28), "O+", [], ["Type 2 Diabetes"], PatientStatus.inactive),
    ("Elena", "Vasquez", date(1994, 10, 8), "B+", ["Ibuprofen"], ["Hypothyroidism"], PatientStatus.active),
    ("Harold", "Fitzgerald", date(1942, 1, 19), "A-", ["Codeine"], ["Congestive Heart Failure", "Gout"], PatientStatus.critical),
    ("Priya", "Sharma", date(1983, 3, 3), "O-", [], ["GERD"], PatientStatus.active),
    ("Daniel", "O'Connor", date(1976, 11, 11), "B-", ["Latex", "Penicillin"], ["Psoriasis"], PatientStatus.inactive),
    ("Grace", "Mbeki", date(1992, 7, 25), "A+", [], ["Iron Deficiency Anemia"], PatientStatus.active),
    ("Viktor", "Sokolov", date(1961, 2, 14), "AB+", ["Contrast dye"], ["Hypertension", "Sleep Apnea"], PatientStatus.active),
    ("Hannah", "Birnbaum", date(2001, 9, 9), "O+", ["Tree nuts"], ["Asthma"], PatientStatus.active),
    ("Samuel", "Adeyemi", date(1968, 12, 30), "B+", [], ["Hyperlipidemia", "Obesity"], PatientStatus.active),
    ("Keiko", "Tanaka", date(1954, 5, 6), "A-", ["Erythromycin"], ["Osteoporosis", "Hypertension"], PatientStatus.active),
]

SEED_NOTES = {
    0: ["A1C at 7.2, up from 6.8. Reinforced dietary counseling; follow up in 3 months.",
        "BP controlled on lisinopril 20mg. No reported side effects."],
    4: ["Admitted overnight for AFib with RVR; rate controlled with diltiazem.",
        "O2 sat 91% on room air. Pulmonology referral placed."],
    8: ["eGFR declined to 38. Nephrology consult scheduled.",],
    12: ["Weight up 3kg in two weeks; diuretic dose adjusted.",
         "Reports improved exercise tolerance since last adjustment."],
    2: ["Spirometry stable. Continue current inhaler regimen."],
}


async def seed_if_empty(db: AsyncSession) -> None:
    """Idempotent startup seed so a fresh docker-compose up has data immediately."""
    repo = PatientRepository(db)
    if await repo.count() > 0:
        return

    now = datetime.now(timezone.utc)
    patients: list[Patient] = []
    for i, (first, last, dob, blood, allergies, conditions, pstatus) in enumerate(SEED_PATIENTS):
        patients.append(
            Patient(
                first_name=first,
                last_name=last,
                date_of_birth=dob,
                email=f"{first.lower()}.{last.lower().replace("'", "")}@example.com",
                phone=f"(555) 01{i:02d}-{1000 + i * 37}",
                address=f"{100 + i * 7} {'Oak Maple Cedar Birch Elm'.split()[i % 5]} St, Springfield, IL 627{i:02d}",
                blood_type=blood,
                allergies=allergies,
                conditions=conditions,
                status=pstatus,
                last_visit=now - timedelta(days=(i * 11) % 180),
            )
        )
    db.add_all(patients)
    await db.flush()

    for idx, notes in SEED_NOTES.items():
        for j, content in enumerate(notes):
            db.add(
                Note(
                    patient_id=patients[idx].id,
                    content=content,
                    created_at=now - timedelta(days=j * 14 + 1),
                )
            )
    await db.commit()

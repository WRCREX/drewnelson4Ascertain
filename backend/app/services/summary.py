from app.models import Note, Patient
from app.schemas.note import PatientSummary


def build_summary(patient: Patient, notes: list[Note]) -> PatientSummary:
    """Template-based narrative; swap for an LLM call behind this same interface later."""
    name = f"{patient.first_name} {patient.last_name}"
    parts = [f"{name} is a {patient.age}-year-old patient (blood type {patient.blood_type})."]

    if patient.conditions:
        parts.append(f"Known conditions: {', '.join(patient.conditions)}.")
    else:
        parts.append("No chronic conditions on record.")

    if patient.allergies:
        parts.append(f"Allergies: {', '.join(patient.allergies)}.")
    else:
        parts.append("No known allergies.")

    if patient.last_visit:
        parts.append(f"Last visit on {patient.last_visit.date().isoformat()}.")

    if notes:
        parts.append(f"{len(notes)} clinical note(s) on file. Most recent entries:")
        for note in notes[:3]:
            snippet = note.content if len(note.content) <= 160 else note.content[:157] + "..."
            parts.append(f"- {note.created_at.date().isoformat()}: {snippet}")
    else:
        parts.append("No clinical notes recorded yet.")

    parts.append(f"Current status: {patient.status.value}.")

    return PatientSummary(
        patient_id=patient.id,
        name=name,
        age=patient.age,
        blood_type=patient.blood_type,
        conditions=patient.conditions,
        allergies=patient.allergies,
        narrative=" ".join(parts),
    )

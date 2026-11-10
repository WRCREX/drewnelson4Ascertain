import { useNavigate, useParams } from "react-router-dom";

import { ErrorState } from "../components/ErrorState";
import { StatusBadge } from "../components/StatusBadge";
import { NotesSection } from "../components/NotesSection";
import { SummaryCard } from "../components/SummaryCard";
import { useDeletePatient, usePatient } from "../hooks/usePatients";
import { styles } from "../styles";

export function PatientDetail() {
  const { id } = useParams();
  const patientId = Number(id);
  const navigate = useNavigate();
  const { data: patient, isPending, isError, error, refetch } = usePatient(patientId);
  const deletePatient = useDeletePatient();

  if (isPending) return <div className={styles.spinner}>Loading patient...</div>;
  if (isError) return <ErrorState error={error as Error} onRetry={() => refetch()} />;

  async function handleDelete() {
    // double-step confirm kept inline; a real product would use a modal component
    if (!window.confirm(`Delete ${patient!.first_name} ${patient!.last_name}? This cannot be undone.`)) return;
    await deletePatient.mutateAsync(patientId);
    navigate("/patients");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className={styles.pageTitle}>
            {patient.first_name} {patient.last_name}
          </h1>
          <p className={styles.pageSubtitle}>
            Patient #{patient.id} · <StatusBadge status={patient.status} />
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={styles.btnSecondary}
            onClick={() => navigate(`/patients/${patient.id}/edit`)}
          >
            Edit
          </button>
          <button
            className={styles.btnDanger}
            onClick={handleDelete}
            disabled={deletePatient.isPending}
          >
            {deletePatient.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className={styles.cardPad}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <div className={`${styles.kvGrid} mt-4`}>
          <span className={styles.kvLabel}>Age</span>
          <span className={styles.kvValue}>{patient.age}</span>
          <span className={styles.kvLabel}>Date of birth</span>
          <span className={styles.kvValue}>{patient.date_of_birth}</span>
          <span className={styles.kvLabel}>Blood type</span>
          <span className={styles.kvValue}>{patient.blood_type}</span>
          <span className={styles.kvLabel}>Email</span>
          <span className={styles.kvValue}>{patient.email}</span>
          <span className={styles.kvLabel}>Phone</span>
          <span className={styles.kvValue}>{patient.phone}</span>
          <span className={styles.kvLabel}>Address</span>
          <span className={styles.kvValue}>{patient.address}</span>
          <span className={styles.kvLabel}>Allergies</span>
          <span className={styles.kvValue}>
            {patient.allergies.length ? patient.allergies.join(", ") : "None recorded"}
          </span>
          <span className={styles.kvLabel}>Conditions</span>
          <span className={styles.kvValue}>
            {patient.conditions.length ? patient.conditions.join(", ") : "None recorded"}
          </span>
          <span className={styles.kvLabel}>Last visit</span>
          <span className={styles.kvValue}>
            {patient.last_visit ? new Date(patient.last_visit).toLocaleString() : "—"}
          </span>
        </div>
      </div>

      <SummaryCard patientId={patientId} />
      <NotesSection patientId={patientId} />
    </div>
  );
}

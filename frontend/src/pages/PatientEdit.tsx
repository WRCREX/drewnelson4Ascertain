import { useNavigate, useParams } from "react-router-dom";

import { ErrorState } from "../components/ErrorState";
import { PatientForm } from "../components/PatientForm";
import { usePatient, useUpdatePatient } from "../hooks/usePatients";
import type { PatientInput } from "../lib/types";
import { styles } from "../styles";

export function PatientEdit() {
  const { id } = useParams();
  const patientId = Number(id);
  const navigate = useNavigate();
  const { data: patient, isPending, isError, error, refetch } = usePatient(patientId);
  const updatePatient = useUpdatePatient(patientId);

  if (isPending) return <div className={styles.spinner}>Loading patient...</div>;
  if (isError) return <ErrorState error={error as Error} onRetry={() => refetch()} />;

  async function handleSubmit(data: PatientInput) {
    await updatePatient.mutateAsync(data);
    navigate(`/patients/${patientId}`);
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>
        Edit {patient.first_name} {patient.last_name}
      </h1>
      <p className={styles.pageSubtitle}>Update this patient's record.</p>
      <div className="mt-6">
        <PatientForm patient={patient} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  );
}

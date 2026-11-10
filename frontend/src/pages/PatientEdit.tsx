import { useNavigate, useParams } from "react-router-dom";

import { PatientForm } from "../components/PatientForm";
import { usePatient, useUpdatePatient } from "../hooks/usePatients";
import type { PatientInput } from "../lib/types";
import { styles } from "../styles";

export function PatientEdit() {
  const { id } = useParams();
  const patientId = Number(id);
  const navigate = useNavigate();
  const { data: patient, isPending, isError, error } = usePatient(patientId);
  const updatePatient = useUpdatePatient(patientId);

  if (isPending) return <div className={styles.spinner}>Loading patient...</div>;
  if (isError) return <div className={styles.formError}>{(error as Error).message}</div>;

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

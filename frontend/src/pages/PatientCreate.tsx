import { useNavigate } from "react-router-dom";

import { PatientForm } from "../components/PatientForm";
import { useCreatePatient } from "../hooks/usePatients";
import type { PatientInput } from "../lib/types";
import { styles } from "../styles";

export function PatientCreate() {
  const navigate = useNavigate();
  const createPatient = useCreatePatient();

  async function handleSubmit(data: PatientInput) {
    const patient = await createPatient.mutateAsync(data);
    navigate(`/patients/${patient.id}`);
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>New Patient</h1>
      <p className={styles.pageSubtitle}>Create a new patient record.</p>
      <div className="mt-6">
        <PatientForm onSubmit={handleSubmit} submitLabel="Create Patient" />
      </div>
    </div>
  );
}

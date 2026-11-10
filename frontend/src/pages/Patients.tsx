import { PatientList } from "../components/PatientList";
import { styles } from "../styles";

export function Patients() {
  return (
    <div>
      <h1 className={styles.pageTitle}>Patients</h1>
      <p className={styles.pageSubtitle}>Search, filter and manage patient records.</p>
      <div className="mt-6">
        <PatientList />
      </div>
    </div>
  );
}

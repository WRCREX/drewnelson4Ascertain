import { usePatientSummary } from "../hooks/usePatients";
import { styles } from "../styles";

export function SummaryCard({ patientId }: { patientId: number }) {
  const { data, isPending, isError, error } = usePatientSummary(patientId);

  return (
    <div className={styles.cardPad}>
      <h2 className={styles.sectionTitle}>Patient Summary</h2>
      {isPending ? (
        <div className={styles.spinner}>Generating summary...</div>
      ) : isError ? (
        <div className={styles.formError}>{(error as Error).message}</div>
      ) : (
        <p className={`${styles.bodyText} mt-3 leading-6`}>{data.narrative}</p>
      )}
    </div>
  );
}

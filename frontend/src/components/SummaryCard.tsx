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
        <p className="mt-3 text-sm leading-6 text-slate-700">{data.narrative}</p>
      )}
    </div>
  );
}

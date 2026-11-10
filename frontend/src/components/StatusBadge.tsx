import type { PatientStatus } from "../lib/types";
import { styles } from "../styles";

export function StatusBadge({ status }: { status: PatientStatus }) {
  return <span className={styles.badge[status]}>{status}</span>;
}

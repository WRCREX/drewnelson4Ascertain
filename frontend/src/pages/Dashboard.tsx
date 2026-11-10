// Dashboard home: quick stats derived from the same list endpoint the table uses,
// so there's no separate stats API to keep in sync.

import { Link } from "react-router-dom";

import { usePatientList } from "../hooks/usePatients";
import { styles } from "../styles";

const baseParams = { page: 1, page_size: 1, sort_by: "last_name", sort_dir: "asc" as const };

export function Dashboard() {
  const all = usePatientList({ ...baseParams });
  const active = usePatientList({ ...baseParams, status: "active" });
  const critical = usePatientList({ ...baseParams, status: "critical" });

  const stat = (q: typeof all) => (q.isPending ? "…" : q.isError ? "—" : q.data.total);

  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p className={styles.pageSubtitle}>Practice overview at a glance.</p>

      <div className={`${styles.statGrid} mt-6`}>
        <div className={styles.cardPad}>
          <div className={styles.statValue}>{stat(all)}</div>
          <div className={styles.statLabel}>Total patients</div>
        </div>
        <div className={styles.cardPad}>
          <div className={styles.statValue}>{stat(active)}</div>
          <div className={styles.statLabel}>Active</div>
        </div>
        <div className={styles.cardPad}>
          <div className={styles.statValue}>{stat(critical)}</div>
          <div className={styles.statLabel}>Critical</div>
        </div>
      </div>

      <div className="mt-6">
        <Link to="/patients" className={styles.btnPrimary}>
          View all patients
        </Link>
      </div>
    </div>
  );
}

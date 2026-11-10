import { Link } from "react-router-dom";

import { styles } from "../styles";

export function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className={styles.pageTitle}>404</h1>
      <p className={styles.pageSubtitle}>That page doesn't exist.</p>
      <div className="mt-6">
        <Link to="/" className={styles.btnPrimary}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

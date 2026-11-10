// Friendly failure state for non-technical users: plain-language message,
// a one-click retry, and a path to a human when retrying doesn't help.

import { styles } from "../styles";

interface Props {
  error: Error;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: Props) {
  return (
    <div className={styles.cardPad}>
      <h2 className={styles.sectionTitle}>Something went wrong</h2>
      <p className={`${styles.bodyText} mt-2`}>{error.message}</p>
      <p className={`${styles.mutedText} mt-1`}>
        Your data is safe. This usually resolves on its own in a moment.
      </p>
      <div className="mt-4 flex items-center gap-4">
        {onRetry && (
          <button className={styles.btnPrimary} onClick={onRetry}>
            Try Again
          </button>
        )}
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Still stuck? Contact your practice IT support.
        </span>
      </div>
    </div>
  );
}

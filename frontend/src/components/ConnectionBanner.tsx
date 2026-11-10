// Full-width banner shown only while the backend is unreachable.
// Written for clinical staff, not engineers: what happened, what we're doing
// about it, what they can do, and who to call if it persists.

import { useHealth } from "../hooks/useHealth";
import { styles } from "../styles";

export function ConnectionBanner() {
  const { isDown, checkNow } = useHealth();

  if (!isDown) return null;

  return (
    <div className={styles.connectionBanner} role="alert">
      <span className={styles.connectionDot} />
      <div className="flex-1">
        <span className="font-semibold">Connection to the server lost.</span>{" "}
        Your data is safe — we're reconnecting automatically and the page will refresh
        itself the moment the server is back. If this lasts more than a few minutes,
        contact your practice IT support.
      </div>
      <button className={styles.connectionRetry} onClick={() => checkNow()}>
        Retry now
      </button>
    </div>
  );
}

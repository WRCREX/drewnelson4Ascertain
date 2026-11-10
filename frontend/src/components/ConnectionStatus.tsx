// Ambient connection indicator that lives in the header on every page.
// Division of labor with ConnectionBanner: the pill is always-on passive status
// (green = connected, red = disconnected); the banner appears only during an
// outage and carries the guidance (what happened, what to do). Status is never
// stated twice in the same voice, so the two are complementary, not redundant.

import { useHealth } from "../hooks/useHealth";
import { styles } from "../styles";

export function ConnectionStatus() {
  const { isDown } = useHealth();

  return (
    <span
      className={styles.statusPill}
      title={
        isDown
          ? "The server is unreachable. See the banner above for what to do."
          : "Live connection to the server is healthy."
      }
    >
      <span className={isDown ? styles.statusDotDown : styles.statusDotUp} />
      {isDown ? "Disconnected" : "Connected"}
    </span>
  );
}

import { NavLink, Outlet } from "react-router-dom";

import { styles } from "../styles";
import { ConnectionBanner } from "./ConnectionBanner";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/patients", label: "Patients", end: false },
];

export function Layout() {
  return (
    <div className={styles.shell}>
      <ConnectionBanner />
      <header className={styles.header}>
        <span className={styles.headerBrand}>Healthcare Dashboard</span>
        <nav className={styles.headerNav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? styles.sidebarLinkActive : styles.sidebarLink
              }
            >
              {item.label}
            </NavLink>
          ))}
        </aside>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

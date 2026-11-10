// Virtualized, searchable, sortable patient list.
// TanStack Virtual renders only visible rows, so the 100+ patient requirement
// (and well beyond) costs constant DOM size.

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";

import { usePatientList } from "../hooks/usePatients";
import { useDebounce } from "../hooks/useDebounce";
import type { PatientStatus } from "../lib/types";
import { styles } from "../styles";
import { ErrorState } from "./ErrorState";
import { StatusBadge } from "./StatusBadge";

const ROW_HEIGHT = 48;
const PAGE_SIZE = 50;

type SortDir = "asc" | "desc";

export function PatientList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PatientStatus | "">("");
  const [sortBy, setSortBy] = useState("last_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const debouncedSearch = useDebounce(search);

  // the Age column sorts by date_of_birth underneath, which runs opposite to age:
  // earliest DOB = oldest patient, so flip the direction sent to the API to keep
  // the on-screen arrow semantically correct for age
  const apiSortDir = sortBy === "date_of_birth" ? (sortDir === "asc" ? "desc" : "asc") : sortDir;

  const { data, isPending, isError, error, isPlaceholderData, refetch } = usePatientList({
    page,
    page_size: PAGE_SIZE,
    search: debouncedSearch,
    status,
    sort_by: sortBy,
    sort_dir: apiSortDir,
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const items = data?.items ?? [];

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  function toggleSort(column: string) {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  }

  function sortIndicator(column: string) {
    if (sortBy !== column) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  if (isError) {
    return <ErrorState error={error as Error} onRetry={() => refetch()} />;
  }

  return (
    <div>
      <div className={styles.listToolbar}>
        <div className="w-72 max-w-full">
          <input
            className={styles.input}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className={`${styles.select} !w-44`}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as PatientStatus | "");
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="critical">Critical</option>
        </select>
        <button
          className={`${styles.btnPrimary} ml-auto`}
          onClick={() => navigate("/patients/new")}
        >
          + Add New Patient
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.listHeaderRow}>
          <button className={styles.sortButton} onClick={() => toggleSort("last_name")}>
            Name{sortIndicator("last_name")}
          </button>
          <button className={styles.sortButton} onClick={() => toggleSort("date_of_birth")}>
            Age{sortIndicator("date_of_birth")}
          </button>
          <button className={styles.sortButton} onClick={() => toggleSort("last_visit")}>
            Last Visit{sortIndicator("last_visit")}
          </button>
          <button className={styles.sortButton} onClick={() => toggleSort("status")}>
            Status{sortIndicator("status")}
          </button>
          <span />
        </div>

        {isPending ? (
          <div className={styles.spinner}>Loading patients...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>No patients match your filters.</div>
        ) : (
          <div
            ref={parentRef}
            className={styles.listContainer}
            style={{ height: Math.min(items.length, 12) * ROW_HEIGHT, opacity: isPlaceholderData ? 0.6 : 1 }}
          >
            <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
              {virtualizer.getVirtualItems().map((row) => {
                const p = items[row.index];
                return (
                  <div
                    key={p.id}
                    className={styles.listRow}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: row.size,
                      transform: `translateY(${row.start}px)`,
                    }}
                    onClick={() => navigate(`/patients/${p.id}`)}
                  >
                    <span className={styles.listRowName}>
                      {p.last_name}, {p.first_name}
                    </span>
                    <span>{p.age}</span>
                    <span>
                      {p.last_visit ? new Date(p.last_visit).toLocaleDateString() : "—"}
                    </span>
                    <StatusBadge status={p.status} />
                    <span className="text-slate-400 text-right">&rsaquo;</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {data && (
        <div className={styles.pagination}>
          <span>
            {data.total} patient{data.total === 1 ? "" : "s"} · page {data.page} of {data.pages}
          </span>
          <div className="flex gap-2">
            <button
              className={styles.btnSecondary}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              className={styles.btnSecondary}
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

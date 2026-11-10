// Single source of truth for styling, per the design decision documented in the README:
// the app is designed on a fixed 1280px grid for pixel-perfect parity with future
// native/mobile ports, with graceful degradation below that width. Every component
// pulls class strings from here, so a restyle (or a token-based mobile port) touches one file.

export const styles = {
  // layout shell: fixed design grid, centered, degrades below 1280
  shell: "mx-auto w-[1280px] max-w-full min-h-screen flex flex-col",
  header:
    "h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-10",
  headerBrand: "text-lg font-semibold tracking-tight text-slate-900",
  headerNav: "flex items-center gap-1",
  navLink:
    "px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100",
  navLinkActive: "px-3 py-2 rounded-md text-sm font-medium bg-slate-900 text-white",
  body: "flex flex-1 min-h-0",
  sidebar:
    "w-56 shrink-0 border-r border-slate-200 bg-white p-4 hidden md:flex flex-col gap-1",
  sidebarLink:
    "px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  sidebarLinkActive: "px-3 py-2 rounded-md text-sm bg-slate-100 text-slate-900 font-medium",
  main: "flex-1 min-w-0 p-6",

  // typography
  pageTitle: "text-2xl font-semibold text-slate-900",
  pageSubtitle: "text-sm text-slate-500 mt-1",
  sectionTitle: "text-base font-semibold text-slate-900",

  // surfaces
  card: "bg-white rounded-lg border border-slate-200 shadow-sm",
  cardPad: "bg-white rounded-lg border border-slate-200 shadow-sm p-5",
  statGrid: "grid grid-cols-1 sm:grid-cols-3 gap-4",
  statValue: "text-3xl font-semibold text-slate-900",
  statLabel: "text-sm text-slate-500 mt-1",

  // controls
  input:
    "h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400",
  select:
    "h-9 rounded-md border border-slate-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400",
  textarea:
    "w-full rounded-md border border-slate-300 bg-white p-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400",
  label: "block text-sm font-medium text-slate-700 mb-1",
  fieldError: "text-xs text-red-600 mt-1",
  formError:
    "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",

  btnPrimary:
    "inline-flex items-center justify-center h-9 px-4 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed",
  btnSecondary:
    "inline-flex items-center justify-center h-9 px-4 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50",
  btnDanger:
    "inline-flex items-center justify-center h-9 px-4 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-500 disabled:opacity-50",
  btnGhostDanger: "text-xs font-medium text-red-600 hover:text-red-500",

  // patient list
  listToolbar: "flex flex-wrap items-center gap-3 mb-4",
  listContainer: "overflow-auto",
  listHeaderRow:
    "grid grid-cols-[2fr_1fr_1.5fr_1fr_0.5fr] gap-4 px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 sticky top-0",
  listRow:
    "grid grid-cols-[2fr_1fr_1.5fr_1fr_0.5fr] gap-4 px-4 items-center border-b border-slate-100 text-sm hover:bg-slate-50 cursor-pointer",
  sortButton: "flex items-center gap-1 hover:text-slate-900",

  // status badges keyed by PatientStatus
  badge: {
    active: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700",
    inactive: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600",
    critical: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700",
  } as const,

  // notes
  noteItem: "border-b border-slate-100 py-3 last:border-0",
  noteMeta: "text-xs text-slate-400 mb-1",
  noteContent: "text-sm text-slate-700 whitespace-pre-wrap",

  // misc
  emptyState: "py-12 text-center text-sm text-slate-500",
  spinner: "py-12 text-center text-sm text-slate-400 animate-pulse",
  pagination: "flex items-center justify-between mt-4 text-sm text-slate-600",
  kvGrid: "grid grid-cols-2 gap-x-8 gap-y-3 text-sm",
  kvLabel: "text-slate-500",
  kvValue: "text-slate-900 font-medium",
} as const;

export function cx(...classes: Array<string | false | undefined>): string {
  // tiny classnames helper to avoid a dependency
  return classes.filter(Boolean).join(" ");
}

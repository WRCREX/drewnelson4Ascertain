# Design Choices — Drew's Calls

The README documents what the architecture is. This file documents the judgment calls behind it — where I deliberately chose, where I deviated from my own defaults, and why.

## Where I overrode my own habits for the right tool

**FastAPI over my usual Flask + Caddy.** My production habit is a Flask `app.py` behind a Caddyfile — minimal, battle-tested, I can stand it up blind. I chose FastAPI here anyway: the spec names it, and for this shape of service it earns its keep — Pydantic validation at the boundary for free, async SQLAlchemy without ceremony, and self-generating OpenAPI docs that double as a review playground at `/docs`. First time shipping Alembic as well; migrations-own-the-schema was worth learning properly rather than reaching for `create_all` because it's familiar. Picking the stack the problem wants over the stack my hands know is the actual skill being tested.

**Conventional monorepo layout over my single-file instinct.** Internally I'd run a flatter structure. For a repo other engineers will clone and judge in minutes, discoverability beats my personal taste: `frontend/` + `backend/` + compose at root, with the backend layered api/repositories/services/schemas/models. Every reviewer knows where everything lives before they open a folder.

## Calls I made against the default meta

**No component library.** The current meta is shadcn/ui and I considered it. I cut it: UI is a strength I'd rather demonstrate than import, and a component library fights the next decision —

**Single-file design system (`styles.ts`).** Every class string in the app lives in one file; components consume tokens, never raw styling. The app is designed on a fixed 1280px grid for pixel-perfect rendering — one canonical, testable layout instead of infinite fluid variants — degrading gracefully below that width (sidebar collapses, grids stack) to keep the spec's low-resolution requirement. The payoff showed up during QA: restyling every dropdown in the app was a one-line change (see edgecasesFIXED.md #1). If this ports to native mobile later, `styles.ts` maps 1:1 onto a design-token system.

**No client-state library.** React's `useState`/`useEffect` sprawl is where dashboards go to die. Almost everything here is server state, so TanStack Query owns it — caching, dedup, invalidation — and the few bits of true UI state (search text, sort column) stay in component state where they're visible. Zustand/Redux would have been résumé-driven complexity.

## Product calls made during QA

**Actions aren't destinations.** "New Patient" started as a sidebar item. Testing showed it masquerading as a page and double-highlighting the nav. I pulled it into the Patients toolbar as "+ Add New Patient" — creation happens where the user already is. Navigation answers "where am I" with exactly one highlight.

**Honest outage UX over placebo controls.** When the backend dies, clinical staff shouldn't see a 502 or an infinite spinner. The app now detects outages within 10 seconds (health polling + request timeouts), says in plain words what happened and that data is safe, retries automatically, and refreshes itself on recovery. I considered a "restart server" button and rejected it: the browser has no control plane over infrastructure, and a button that pretends otherwise is worse than the truth. The real version — an ops agent that diagnoses and restarts services, paging humans only when automation fails — is scoped in the README's "What I'd Do Next."

**Sort indicators must not lie.** The Age column sorts by date of birth, whose order is the inverse of age. The arrow now reflects age semantics and the direction flip happens at the API call site. Small thing; the kind of small thing users silently stop trusting you over.

## Scope discipline

The spec says 2–4 hours and "complete as many core tasks and stretch goals as possible." I took all five parts plus three stretch items (Alembic migrations, list virtualization, route code-splitting) and spent remaining budget on QA hardening rather than more features — the edge-case log documents that trade. A feature nobody can run is worth less than a smaller thing that survives contact with a reviewer's machine.

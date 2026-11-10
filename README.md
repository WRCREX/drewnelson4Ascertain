# Healthcare Dashboard

Patient management dashboard for a medical practice. React (TypeScript) frontend, FastAPI backend, PostgreSQL database, fully containerized.

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| API docs (OpenAPI) | http://localhost:8000/docs |
| Health check | http://localhost:8000/health |

On first boot the backend runs Alembic migrations and seeds the database with 20 realistic patients and sample clinical notes. The seed is idempotent — restarting never duplicates data.

## Using the App

Everything below assumes `docker compose up --build` has finished and you're at **http://localhost:3000**.

1. **Dashboard** (`/`) — practice overview: total, active and critical patient counts, with a shortcut into the patient list.
2. **Patient list** (`/patients`) — the 20 seeded patients, sorted by last name.
   - **Search** the box at the top left by name or email (try `gonz`); results update as you type without blocking input.
   - **Filter** by status with the dropdown (Active / Inactive / Critical).
   - **Sort** by clicking any column header (Name, Age, Last Visit, Status); click again to flip direction.
   - Rows are virtualized — paste in thousands of patients and scrolling stays smooth.
3. **Patient detail** — click any row. You'll see the full profile, a **generated patient summary** (synthesized server-side from the profile + notes), and the **clinical notes** section.
   - Add a note with the text box (try "BP 140/90, follow up in 2 weeks") — the summary card updates to reflect it.
   - Delete a note with the Delete link on its row.
4. **Create a patient** — "Add Patient" button on the list (or `/patients/new`). Submit the empty form to see field-level validation; server-side validation errors render on the exact same fields (e.g. force a bad payload via the API docs).
5. **Edit / delete** — buttons at the top of any patient detail page. Delete asks for confirmation and returns you to the list.
6. **API playground** — http://localhost:8000/docs is interactive OpenAPI: every endpoint can be exercised from the browser, no client needed. Quick checks:

```bash
curl http://localhost:8000/health
curl "http://localhost:8000/patients?search=gonzalez"
curl http://localhost:8000/patients/1/summary
```

**Ports used:** `3000` frontend (nginx), `8000` API (uvicorn), `5433` Postgres (host side — deliberately not 5432, so a locally installed Postgres never collides; connect with `psql -h localhost -p 5433 -U postgres healthcare`). If any are taken locally, remap the left side of the port pairs in `docker-compose.yml` (e.g. `"3001:80"`) or set `POSTGRES_HOST_PORT` in `.env`.

## Running Without Docker

Backend (requires a local Postgres):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:8000`, so no CORS configuration is needed in development.

## Architecture

```
backend/
  app/
    api/routes/      HTTP layer: request/response handling only
    repositories/    all SQL/ORM access
    services/        domain logic (e.g. summary generation)
    schemas/         Pydantic request/response contracts
    models/          SQLAlchemy ORM models
    core/            configuration
    db/              session management, seed
  alembic/           migrations (schema is migration-owned, never create_all)
frontend/
  src/
    pages/           route-level components
    components/      reusable UI
    hooks/           TanStack Query hooks (all server state)
    lib/             API client + shared types
    styles.ts        single-file design system
```

### Key Decisions & Why

**TanStack Query for server state, no client-state library.** Nearly all state in this app is server state: patient lists, details, notes, summaries. TanStack Query gives caching, request de-duplication, background refetching and precise cache invalidation, which eliminates the sprawling `useState`/`useEffect` chains that make React apps hard to maintain. The little true client state that exists (search text, sort column) stays in component state where it belongs. Adding Zustand or Redux here would be complexity without payoff.

**Repository/service layering on the backend.** Routes handle HTTP concerns, repositories own persistence, services own domain logic. The summary generator is a service behind a stable interface — swapping the template implementation for an LLM call later touches one file. As the app grows to "multiple user types, complex workflows, and real-time features," this layering is what keeps it maintainable.

**Alembic-owned schema.** The database schema lives in versioned migrations, never `create_all`. Any developer (or CI) can recreate the database from scratch with `alembic upgrade head`, and future schema changes ship as reviewable diffs.

**Single-file design system (`styles.ts`).** Every component pulls its class strings from one file. The app is deliberately designed on a fixed 1280px grid for pixel-perfect rendering, with graceful degradation below that width (sidebar collapses, grids stack). Rationale: if this product is later ported to native mobile, a centralized, token-like style file maps cleanly onto a design-token system, and the fixed design grid means every screen has one canonical, testable rendering rather than infinite fluid variants. Restyles touch one file instead of fifty components.

**Virtualized patient list.** TanStack Virtual renders only visible rows, so DOM cost is constant whether the page holds 50 or 5,000 patients. Combined with server-side pagination (50/page), search and sorting pushed down to Postgres with proper indexes, the list meets the 100+ patient requirement with a large margin.

**Non-blocking search.** Input is debounced (300ms), queries run through TanStack Query with `keepPreviousData`, so the previous results stay rendered (dimmed) while the next page loads. Typing never blocks and the UI never flashes empty.

**Validation on both sides, one error shape.** Zod validates client-side before a request is made; Pydantic validates server-side as the source of truth. The API flattens 422s into `{field, message}` pairs and the form maps them back onto the matching inputs, so server-only failures surface exactly like client ones. Network failures are caught distinctly and surfaced with a clear message.

**Pagination envelope.** List responses return `{items, total, page, page_size, pages}` so the client renders totals and page controls without extra requests.

### API Surface

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/patients` | List (pagination, `search`, `status`, `sort_by`, `sort_dir`) |
| POST | `/patients` | Create |
| GET | `/patients/{id}` | Read |
| PUT | `/patients/{id}` | Update |
| DELETE | `/patients/{id}` | Delete |
| GET | `/patients/{id}/notes` | List notes |
| POST | `/patients/{id}/notes` | Add note |
| DELETE | `/patients/{id}/notes/{note_id}` | Delete note |
| GET | `/patients/{id}/summary` | Generated patient summary |

Errors use appropriate status codes: 404 for missing resources, 422 with structured field errors for validation, 204 for deletes.

### Stretch Goals Implemented

- **Database migrations with Alembic** (schema versioning from day one)
- **List virtualization** with TanStack Virtual
- Sorting/filtering query parameters on the list endpoint
- Request logging middleware (method, path, status, duration on every request)
- Route-level code splitting (each page ships as its own chunk)
- Dark/light theme switching (header toggle; respects OS preference on first visit, persists the choice, and the entire theme lives in the single-file design system)

### What I'd Do Next

- Auth (practice staff vs. clinician roles) at the router dependency level
- An ops agent for self-healing: the UI's ErrorState already funnels outages to one component; the next step is an agent that watches health checks, diagnoses (logs, container state) and restarts services, paging a human only when automation fails
- WebSocket channel for real-time status changes, invalidating the Query cache
- pytest suite against a throwaway Postgres (testcontainers) for the repository layer
- CI: lint + typecheck + build on PR

# Edge Cases & UX Findings

QA log from manual passes over the running app. Each entry: what was found, why it matters, how it was resolved.

## 1. Dropdowns didn't read as dropdowns

**Found:** On the New Patient form, the Blood type and Status `<select>` elements rendered at native width next to full-width text inputs. Visually they broke the form grid, and without a clear affordance it wasn't obvious they were submenus at all.

**Why it matters:** Form scanability — a user filling the form hits two controls that look like misaligned buttons instead of pickable fields.

**Fix:** Selects now span full width like every other field, with native styling stripped (`appearance-none`) and a custom chevron icon so the affordance is explicit. The status filter on the patient list keeps a fixed width so the toolbar stays compact, via a width override on the same shared style token. One change in `styles.ts` + one CSS utility restyled every select in the app — the single-file design system doing its job.

## 2. "New Patient" as a sidebar sibling was confusing navigation

**Found:** The sidebar listed New Patient as a peer of Dashboard and Patients, but it's an action on the patients collection, not a destination. Worse, navigating to `/patients/new` highlighted both Patients and New Patient simultaneously (the Patients link matches the route prefix), so the sidebar showed two "current" locations at once.

**Why it matters:** Navigation should answer "where am I?" with exactly one highlight, and actions shouldn't masquerade as places.

**Fix:** Removed New Patient from the sidebar. Creation now lives where the user already is when they need it: a prominent "+ Add New Patient" button pinned to the right of the patient list toolbar. The route `/patients/new` still exists and is deep-linkable; the sidebar highlight correctly resolves to Patients for the entire patients section.

## 3. Compose failed on machines running a local Postgres

**Found:** `docker compose up` died with `Bind for 0.0.0.0:5432 failed: port is already allocated` on a machine with a native Postgres install. Dev machines very commonly have Postgres on 5432 (Homebrew, Postgres.app), so this would hit reviewers too.

**Why it matters:** "Easy local setup" is a stated evaluation criterion; a port collision on the single most common database port is the opposite of that.

**Fix:** The backend reaches the database over Docker's internal network (`db:5432`), so the host mapping is purely a convenience for inspecting the DB with `psql`. The host side now defaults to 5433 (overridable via `POSTGRES_HOST_PORT`), which cannot collide with a stock local Postgres. Documented in the README's port table.

## 4. Age column's sort arrow was semantically inverted

**Found:** During a full browser QA pass: clicking the Age header twice showed "Age ↓" while ages rendered ascending 25 → 57. The column sorts by `date_of_birth` server-side, and DOB order is the inverse of age order (earliest birth date = oldest patient), so the arrow told the opposite of the truth.

**Why it matters:** A sort indicator that lies is worse than no indicator — users make decisions from it.

**Fix:** The UI keeps its arrow state in age semantics and flips the direction it sends to the API when (and only when) the sort column is `date_of_birth`. Server API unchanged; the mapping is one line at the single call site.

## 5. Backend outage showed "Request failed (502)" to clinical users

**Found:** With the backend container stopped (simulating an API outage), the UI showed a raw "Request failed (502)" — because nginx answers for the dead upstream, the gateway error bypassed the friendly network-failure message. Medical staff would have no idea what a 502 is or what to do about it.

**Why it matters:** The users of this product are clinicians, not engineers. An error state has to answer: what happened (in plain language), is my data safe, and what do I do now.

**Fix:** Gateway statuses (502/503/504) are now translated to "The server is temporarily unavailable." and every top-level error surface renders a shared `ErrorState` component: plain-language message, reassurance that data is safe, a one-click Try Again (refetches via TanStack Query), and a pointer to IT support if retrying doesn't resolve it. A future direction noted in the README: an ops agent with diagnose/restart capabilities watching these failures — fitting, given the domain.

## 6. During an outage the UI hung on "Loading..." with no timeout and no status

**Found:** Follow-up testing on #5: when the backend container stops, nginx keeps dialing the dead upstream's IP and waits out its full connect timeout (~60s) before answering 502. From the user's chair that's an indefinite "Loading patients..." — no error, no explanation, nothing to do but stare.

**Why it matters:** An infinite spinner is the worst outage UX there is: it doesn't admit anything is wrong, so users blame themselves, refresh repeatedly, or walk away mid-task.

**Fix:** Two layers.
1. **Client-side request timeout (10s)** via `AbortSignal.timeout` — no request can hang the UI longer than that, and the timeout surfaces as "The server is taking too long to respond."
2. **Connection monitor + banner**: the app polls `GET /health` every 10s. The moment it fails, a red banner appears on every page — "Connection to the server lost. Your data is safe — we're reconnecting automatically..." — with a Retry now button and an IT-support pointer. When the health check succeeds again, the monitor invalidates every cached query, so the whole app refreshes itself without the user touching anything.

Deliberately out of scope: a "restart the server" button in the browser. The frontend has no control plane over the infrastructure, and pretending otherwise (a button that can't actually restart anything) would be worse than honest messaging. The real version of that idea — an ops agent that diagnoses and restarts services — lives in the README's "What I'd Do Next."

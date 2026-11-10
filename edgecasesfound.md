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

# Edge Cases & UX Findings

QA log from manual passes over the running app. Each entry: what was found, why it matters, how it was resolved.

## 1. Dropdowns didn't read as dropdowns

**Found:** On the New Patient form, the Blood type and Status `<select>` elements rendered at native width next to full-width text inputs. Visually they broke the form grid, and without a clear affordance it wasn't obvious they were submenus at all.

**Why it matters:** Form scanability — a user filling the form hits two controls that look like misaligned buttons instead of pickable fields.

**Fix:** Selects now span full width like every other field, with native styling stripped (`appearance-none`) and a custom chevron icon so the affordance is explicit. The status filter on the patient list keeps a fixed width so the toolbar stays compact, via a width override on the same shared style token. One change in `styles.ts` + one CSS utility restyled every select in the app — the single-file design system doing its job.

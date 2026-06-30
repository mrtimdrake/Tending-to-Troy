# Tending to Troy
## Internal Alpha Readiness Review
### Date: 30 June 2026
### Goal: Tim can send Nicola the URL and both comfortably use it for real household management.

This document pauses feature development. No major new functionality. The focus is stability, deployment, and usability. Milestone 4 begins only after Alpha is complete.

---

## 1. Summary Verdict

The application is **functionally complete for daily two-person use** (auth, household, task CRUD, real-time sync) but is **not yet Alpha-ready**. The gaps are not features — they are reliability and polish: no error/loading states, a service-worker registration bug, three known UX issues, and a few edge cases that would confuse real users.

Estimated work to Alpha: **small-to-medium**, mostly defensive code and minor UX, no architectural change.

---

## 2. Must-Fix Before Alpha (prioritised)

These block comfortable daily use. Each is small.

| # | Issue | Severity | Area | Status |
|---|-------|----------|------|--------|
| 1 | **No error boundary** — any thrown error shows the raw Next error page | High | Reliability | ✅ done — `app/error.tsx`, `app/global-error.tsx` |
| 2 | **No loading states** — tapping a task shows a blank pause before detail loads | High | Polish | ✅ done — `loading.tsx` for home/task/settings |
| 3 | **`/sw.js` is caught by middleware** and redirected to sign-in when logged out → service worker fails to register / PWA install unreliable | High | PWA / Deployment | ✅ done — excluded from middleware matcher |
| 4 | **Search icon does nothing** — a visible control that fails on tap reads as broken | High | UX | ✅ done — removed (returns in Milestone 5) |
| 5 | **TaskDetail archive/delete ignore failures** — navigates even if the action errored | High | Reliability | ✅ done — checks result, inline error |
| 6 | **Auto-save debounce loses fields** — editing two fields within 600ms drops the first | Medium | Data integrity | ✅ done — merged pending patch + flush on selects |
| 7 | **Settings not editable** — name/display cannot be changed | Medium | UX | ✅ done — display name + home name editable |
| 8 | **Invitation panel too prominent** in Settings | Low | UX | ✅ done — collapsed behind a disclosure |
| 9 | **`<html lang="en">`** should be `en-GB` | Low | Accessibility | ✅ done |
| 10 | **Silent failures** — `getActiveTasks` returns `[]` on DB error; a real outage looks like "no tasks" | Medium | Reliability | ✅ done — throws on error, logs; SW + history log too |

---

## 3. Application Review — blockers to daily use

**Works well today:** registration, invitation, sign-in/out, create/edit/archive/restore/delete, real-time sync between two sessions, RLS household isolation, optimistic create with rollback.

**Would frustrate real users:**
- Tapping a task → brief blank while the server fetches (no loading state).
- A failed save/archive/delete is invisible or misleading (see #5, #10).
- The search button looks functional but isn't (#4).
- No friendly first-run empty state — a brand-new household sees four "Nothing here yet." rows with no guidance to tap "+".
- If a task is opened that was just deleted on the other device, the detail page redirects home with no explanation.

---

## 4. Deployment Checklist

### Vercel
- [ ] Project imported from the Git repo, framework preset = Next.js
- [ ] Environment variables set (Production + Preview):
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (server-only — never `NEXT_PUBLIC_`)
- [ ] Production build passes locally (`npm run build`) before first deploy
- [ ] Note the production domain (e.g. `tending-to-troy.vercel.app`)

### Supabase
- [ ] Migrations applied to the production project, in order: `001_schema.sql`, `002_rls.sql`, `003_realtime.sql`
- [ ] Confirm `tasks` is in the `supabase_realtime` publication (done — verified 30 Jun)
- [ ] **Rotate the anon + service-role keys** that were shared in chat, then update Vercel env vars
- [ ] Auth → Email → "Confirm email" **OFF** (intentional for V1; documented to revisit before any public release)
- [ ] Auth → URL Configuration → Site URL set to the Vercel production domain
- [ ] RLS confirmed enabled on every table (it is, via 002)

### Build / Security / Caching
- [x] `next build` clean (no type or lint errors) — verified 30 Jun
- [x] `sw.js` excluded from middleware matcher (fix #3) so it serves with the correct MIME type
- [x] `Cache-Control: no-cache` on `/sw.js` (in `next.config.ts`)
- [x] Service-role key never imported into a client component (server-only ✓)
- [x] Basic security headers added (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`)
- Note: benign build warning — `supabase-js` references `process.version` in the Edge middleware; works on Vercel, no action needed.

### PWA / Icons / Manifest
- [ ] `manifest.json` correct (name, short_name, theme/background `#F5E8A8`, `lang: en-GB`, scope `/`) ✓
- [ ] All icons present: 192/512 (any), 192/512 (maskable), apple-touch-icon ✓
- [ ] Service worker registers on production HTTPS (verify in DevTools → Application after fix #3)
- [ ] Installable on iPhone Safari (Add to Home Screen) and Android Chrome (Install)
- [x] `<html lang>` = `en-GB` (fix #9)

---

## 5. Alpha Testing Checklist

Run on each target: **iPhone Safari, Android Chrome, desktop Chrome, desktop Safari.**

### Onboarding
- [ ] First registration creates the household and lands on home
- [ ] Invitation link generates and copies in Settings
- [ ] Second user opens invite link, registers, joins the same household
- [ ] Invitation expires / is marked used after the second user joins
- [ ] A third registration is refused

### Core tasks
- [ ] Create a task (title, priority, owner, location, description, notes) — appears immediately
- [ ] Open a task — all fields shown correctly
- [ ] Edit title/description/notes — auto-saves, "Saved" shows
- [ ] Change priority/owner/location — saves and re-sorts
- [ ] Archive a task — leaves the active list
- [ ] Restore an archived task — returns to active
- [ ] Delete a task — confirmation required, then removed
- [ ] Edit then quickly edit a second field — **both** changes persist (regression test for #6)

### Multi-user / realtime
- [ ] Two users, two devices: create on A appears on B within seconds
- [ ] Edit on A reflects on B
- [ ] Archive/delete on A removes from B
- [ ] Simultaneous edit: last write wins, history records both (check DB)

### Sessions / resilience
- [ ] Sign out returns to sign-in; protected routes redirect when signed out
- [ ] Browser refresh on home / task / settings keeps you signed in and in place
- [ ] Open a task that the other user just deleted → graceful redirect, no crash
- [ ] Airplane-mode / offline: app does not silently lose an edit (online-only — failure must be visible, not silent)
- [ ] PWA installed from home screen launches standalone and works

---

## 6. UX Review — small improvements only (no redesign)

1. **Remove the Search icon for Alpha** (#4). A non-working control is worse than none. Re-introduce in Milestone 5 when search is built.
2. **Make Settings editable** (#7): allow editing the display name. One field, server action, optimistic. Optionally the household name.
3. **Quieten the invitation panel** (#8): collapse it behind a "Invite your partner" row/disclosure in Settings, or render it as a single secondary "Copy invite link" action rather than a full card. It should not dominate Settings once it's the only other content.
4. **Warmer first-run empty state**: when a household has zero tasks, replace four identical "Nothing here yet." rows with one gentle prompt ("Add your first task with the + button").
5. **Wording**: "Create home" on register is good; consider "Add task" consistency everywhere (button says "Add task", form title says "New task" — fine, but keep verbs consistent).
6. **Spacing/consistency**: the global `button { min-height/min-width: 44px }` rule in `globals.css` forces every link/button to 44px — verify it doesn't inflate inline text buttons awkwardly (e.g. "Delete task"). Scope it to interactive controls that need it.
7. **Accessibility**: confirm focus-visible styles on all interactive elements; confirm colour contrast of slate-on-paper meets AA (the slate `#5B6C80` on paper `#F5E8A8` is borderline — check).

---

## 7. Technical Review — before real reliance

- **Error boundary (#1):** add `app/error.tsx` (and `app/global-error.tsx`) with a calm, on-brand "Something went wrong — try again" rather than the raw stack.
- **Loading states (#2):** add `app/task/[id]/loading.tsx` and `app/settings/loading.tsx` (and optionally `app/home/loading.tsx`) so navigation feels instant.
- **not-found:** add `app/not-found.tsx` for unknown routes.
- **TaskDetail action results (#5):** check the action result before navigating; show an inline error and stay on the page if it failed.
- **Auto-save correctness (#6):** debounce per-field, or flush the pending patch before starting a new field's edit, so no field's save is dropped.
- **Surface read failures (#10):** distinguish "no tasks" from "couldn't load tasks" — return/log the error and show a retry affordance.
- **Logging:** replace silent `catch {}` blocks (e.g. `ServiceWorkerRegistration`, history writes) with at least `console.error` so failures are diagnosable. Consider Vercel's runtime logs for server actions.
- **Optimistic consistency:** TaskDetail mutates via raw actions (no optimistic/rollback) while the home list uses `useTaskMutations`. Acceptable, but document the difference; detail edits rely on the server result + realtime echo.
- **Realtime auth refresh:** `setAuth` is set once on mount from the current session. For long-lived tabs, re-set on token refresh (`onAuthStateChange`) so sync survives a token expiry. Low priority for Alpha (1-hour sessions) but note it.
- **Race — delete while editing:** if the other user deletes a task you're editing, your next save will no-op (RLS/row gone). Handle the empty update result gracefully.
- **Performance:** fine at two-user scale. One realtime channel per home mount; no N+1; queries are small. No action needed.

---

## 8. Internal Alpha Ready — Definition of Done

The app is **Internal Alpha Ready** only when every box is checked.

### Reliability
- [x] `app/error.tsx` + `app/global-error.tsx` present, on-brand
- [x] `app/not-found.tsx` present
- [x] Loading states for task detail and settings (and home)
- [x] TaskDetail archive/delete handle failure (no false-success navigation)
- [x] Auto-save never drops a field
- [x] Read failures are distinguishable from empty and are logged

### Deployment
- [x] Deployed to Vercel on a stable URL over HTTPS (live 30 Jun; sign-in + home verified)
- [x] All three env vars set in Vercel (service-role server-only)
- [x] Next.js upgraded to 15.3.9 (CVE-2025-66478 — Vercel deploy blocker)
- [x] Migrations 001–003 applied to production
- [x] `sw.js` excluded from middleware
- [ ] Supabase **Auth → Site URL + Redirect URLs** set to the Vercel domain
- [ ] **Rotate the `sb_secret_…` key** (shown in screenshots) and update Vercel
- [ ] SW registers in production (verify DevTools → Application)
- [ ] PWA installs on iPhone Safari and Android Chrome

### Usability
- [x] Search control removed (or working)
- [x] Settings: display name + home name editable
- [x] Invitation panel quietened in Settings
- [x] Friendly first-run empty state
- [x] `lang="en-GB"`

### Validation
- [ ] Full Alpha Testing Checklist (§5) passed on all four target browsers
- [ ] Two real people (Tim + Nicola) each complete: register/join, create, edit, archive, restore, delete, sign out, refresh — without help

---

## 9. Recommended Sequence

1. Reliability fixes (#1, #2, #5, #6, #10) — defensive code, no UX change.
2. PWA/deployment fixes (#3, #9) + deploy to Vercel.
3. UX smalls (#4 remove search, #7 editable settings, #8 quieten invite, empty state).
4. Run the full testing checklist on all four browsers with both users.
5. Sign off the "Internal Alpha Ready" checklist → only then Milestone 4.

# Tending to Troy
## Milestone 3 Review
### Phase 3a — Core Task CRUD & Real-time Sync
### Branch: `feature/milestone-3-data`
### Date: 30 June 2026

---

## Objectives

Replace placeholder data with a live, two-person task system: create, edit, archive, delete, and real-time sync between both users. The home screen stops being a mockup and becomes the actual record of the home. Online-only by decision (offline deferred to end of roadmap, may be cut).

---

## Deliverables

**Data layer — `features/tasks/`**
- `types.ts` — `Task` view-model + `CreateTaskInput` / `UpdateTaskInput`, decoupled from the raw DB row.
- `mapping.ts` — single row→view-model mapper + `sortTasks` (pinned first, then manual order, newest-first on ties).
- `queries.ts` — server-side `getActiveTasks` / `getTaskById`, RLS-scoped.
- `actions.ts` — server actions: create / update / archive / restore / delete, each writing a `task_history` entry.
- `history.ts` — admin-client history writer (best-effort; never rolls back the user's edit).
- `useTasks.ts` — client state seeded from the server render + Realtime subscription.
- `useTaskMutations.ts` — the single mutation entry point with optimistic updates + rollback.

**UI**
- Home renders live data; placeholder file deleted.
- Task creation via a floating brass "+" (FAB) opening a bottom-sheet/modal form (title, priority, owner, location, **description, notes**).
- Task detail route `/task/[id]` with inline auto-save (debounced text, immediate selects) and a save-state indicator.
- Delete (confirmation) / archive / restore.
- Settings page `/settings` — account info, invite-partner panel (moved off home), sign out. Reached from the nav gear icon.
- `supabase/migrations/003_realtime.sql` — adds `tasks` to the realtime publication.

---

## Architectural Decisions

1. **Single mutation path.** All writes go through `useTaskMutations` → server actions. Keeps optimistic logic in one place and means *if* offline is ever revived, queueing slots in here without touching components.

2. **View-model decoupling.** Components depend on the `Task` view-model, never raw Supabase rows, so storage and UI shapes can diverge.

3. **History via admin client.** `task_history` has no client insert policy (RLS migration 002); history is written server-side so the trail can't be tampered with. It is the safety net for last-write-wins.

4. **Online-only.** Confirmed with the user (29 June). Offline support deferred to the very end of the roadmap and subject to a go/no-go; it may be cut. Not a blocker for any earlier milestone.

5. **FAB over nav "+", invite moved to Settings.** UX iteration during the milestone: add-task is a floating action; the invite panel belongs in Settings, not on the home screen.

---

## Issues Found & Fixed During the Milestone

- **`@supabase/ssr` 0.6.1 typed all writes as `never`** — its bundled types target an older 3-param client. Upgraded to ^0.12.0 (matches supabase-js 2.108).
- **`manual_order` int4 overflow** — `-Date.now()` exceeded the integer column and silently failed every insert ("adding a task does nothing"). New tasks now use the default (0) + newest-first sort tiebreaker.
- **Hydration mismatch after the refactor** — stale dev bundle; resolved by clearing `.next` and restarting.
- **Realtime delivered nothing** — adding the table to the publication is not enough; the realtime socket must be authenticated (`supabase.realtime.setAuth(token)`) or RLS filters out every change. Fixed in `useTasks.ts`.

(All three Supabase traps recorded in project memory.)

---

## Deviations from PRD

- **Offline** — PRD lists it as a hard requirement; superseded by the online-only decision (see above).
- Pinning/drag (3b), checklist/shopping/links/rich-text/full-history UI (Milestone 4), weather, and search remain out of scope as planned.

---

## Known Issues / Notes

- **Detail edits and archive/delete are not yet user-confirmed end-to-end** — create + real-time sync verified by the user; a final smoke test of auto-save, archive, restore, delete, settings, and sign-out is recommended before merge.
- **No automated tests** — still accruing; the data layer (sort, mapping, mutation reconciliation) is the first thing that should get unit tests.
- **`task_history` UI not built** — entries are written but only visible in the DB; the history timeline is a Milestone 4 deliverable.
- **Supabase keys** — reminder that the keys shared earlier in chat should be rotated if not already done.

---

## Recommendation

**READY TO MERGE** once the final smoke test passes (auto-save, archive/restore, delete with confirmation, settings + sign out). Create and real-time sync — the milestone's core risk — are verified working. The data layer is cleanly structured, typed, RLS-scoped, and extensible for Milestone 3b (pinning/ordering) and Milestone 4 (detail sub-features).

A Milestone 3b plan (pinning, brass pin, drag-to-reorder) should follow before Milestone 4.

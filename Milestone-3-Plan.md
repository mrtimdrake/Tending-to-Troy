# Tending to Troy
## Milestone 3 Implementation Plan
### Phase 3a — Core Task CRUD & Real-time Sync
### Branch: `feature/milestone-3-data`

---

## Guiding Philosophy

Milestone 2 made the app *look* like itself. Milestone 3 makes it *real*.

When this milestone is complete, the placeholder tasks are gone. Both of you can create tasks, edit them, archive them, and delete them — and a change made on one phone appears on the other within seconds, with no refresh and no save button. The home screen stops being a beautiful mockup and becomes the actual record of your home.

The design foundation from Milestone 2 does not change. We are wiring data into existing components, not redesigning. Where a new screen is needed (task detail, task creation), it inherits the established design language — warm, quiet, serif titles, ivory cards on paper.

**Scope discipline carries over.** This milestone is deliberately bounded. Rich sub-features (checklist, shopping list, links, full history UI) belong to Milestone 4. Pinning and drag-to-reorder belong to Milestone 3b. The offline queue is split into its own milestone (3.5). See "Deliberately Deferred" below for the reasoning.

---

## Two Scope Decisions To Confirm

Before implementation, two decisions shape what gets built. Recommendations given; both are reversible.

### Decision 1 — Online-only (CONFIRMED)

**Decision (29 June 2026):** The application is online-only for the foreseeable future. Offline support is deferred to the very end of the roadmap, after all other features are complete — and at that point it is subject to a go/no-go review. It may be dropped entirely.

This supersedes the PRD's "offline is a hard requirement" line for the purposes of build sequencing. If you lose connection mid-edit, the app behaves like a normal web app: the write fails and surfaces an error. No queue, no localStorage replay.

The mutation layer (see 3.0) is still built as a single write path, so *if* offline is ever revived it can be added there without rework — but nothing else in the build assumes it.

### Decision 2 — Create & edit UX pattern

The "add task" pattern was intentionally left undesigned in Milestone 2. Proposal:

- **Create:** a "+" action (quiet brass `+` in the navigation bar, right of the icons — no loud floating action button, in keeping with the calm aesthetic). Opens a small create form. On mobile this is a bottom sheet; on desktop a centred modal. Minimal fields only: title, priority, owner, location. Everything else is added later on the detail screen.
- **Edit:** tapping a task card navigates to a dedicated task detail route (`/task/[id]`). All core fields editable inline, auto-saving on change. This is the screen Milestone 4 will later extend with checklist/shopping/links.

**Recommendation:** proceed as above. If you'd prefer the create flow to also be a full route rather than a sheet/modal, say so before I start.

---

## Scope

**In scope:**
- Data access layer for tasks (`features/tasks/`)
- Replace placeholder tasks with live Supabase data on the home screen
- Task creation (title, priority, owner, location)
- Task detail route — view and edit core fields
- Auto-save on edit (debounced; no save button)
- `task_history` entry written on every meaningful change
- Delete (confirmation required, soft-delete `status='deleted'`)
- Archive / restore (`status='archived'`)
- Real-time sync between both users via Supabase Realtime
- Optimistic UI for the acting user

**Out of scope (later milestones):**
- Offline queue → deferred to end of roadmap, may be cut (see Decision 1)
- Pinning & drag-to-reorder → Milestone 3b
- Checklist, shopping list, links, rich-text, full history timeline → Milestone 4
- Weather → Milestone 4/5
- Search → Milestone 5

---

## Folder Structure (new)

The `features/` directory is introduced now, per the Technical Architecture.

```
/features
  /tasks
    queries.ts        — read helpers (server-side fetch for initial render)
    actions.ts        — server actions: create, update, archive, restore, delete
    history.ts        — writes task_history entries
    useTasks.ts       — client hook: holds task state + subscribes to Realtime
    useTaskMutations.ts — client hook: wraps actions with optimistic updates
    mapping.ts        — DB row ⇄ view-model mapping (single source of truth)
    types.ts          — Task view-model type used by components
/app
  /task
    /[id]
      page.tsx        — server component, fetches task, redirects if not found
      TaskDetail.tsx  — client component, editable fields + auto-save
  /home
    NewTaskButton.tsx — the "+" trigger
    NewTaskForm.tsx   — create form (sheet/modal)
```

`lib/placeholder/tasks.ts` is deleted at the end of this milestone.

---

## Task Breakdown

### 3.0 — Mutation Layer Foundation (do first)

Before any feature, establish the single path all writes go through. This is what makes the 3.5 offline split free.

- `features/tasks/actions.ts` — server actions using the authenticated server client (RLS enforces household scoping; no service-role needed for task CRUD since RLS policies already allow household members).
- Every action: validates input, performs the write, appends a `task_history` row, returns the updated row.
- `features/tasks/useTaskMutations.ts` — the only thing components call. Applies an optimistic update locally, calls the server action, reconciles on response, rolls back on error. Milestone 3.5 will later intercept here to queue when offline.

### 3.1 — Read & Render Live Data

- `features/tasks/queries.ts` — `getActiveTasks(householdId)` returns active tasks for the household, ordered by priority then `manual_order`.
- `features/tasks/mapping.ts` + `types.ts` — map DB rows to a clean `Task` view-model. Components depend on the view-model, never raw rows.
- Update `app/home/page.tsx` to fetch real tasks server-side and pass them in.
- Update `PrioritySection` / `TaskCard` to consume the view-model. Card visuals unchanged.
- Delete `lib/placeholder/tasks.ts`.

### 3.2 — Task Creation

- `NewTaskButton` in the navigation; `NewTaskForm` (bottom sheet on mobile, modal on desktop).
- Fields: title (required), priority (1–4, default 1), owner (Tim/Wife/Anyone, default Anyone), location (Indoor/Outdoor, default Indoor).
- On submit: optimistic insert at top of its priority group → appears immediately, confirmed via Realtime.
- Writes a `created` history entry.

### 3.3 — Task Detail & Editing

- `/task/[id]` route. Server component fetches the task (404/redirect if not in household — RLS guarantees this).
- `TaskDetail` client component: title, priority, owner, location, description, notes editable inline.
- Auto-save: debounce ~600ms after last keystroke / immediately on select change. No save button. Subtle "Saved" affordance.
- Each save appends a `task_history` entry (e.g. "Priority changed to 2 by Tim").
- Back navigation returns to home, preserving scroll/section state.

### 3.4 — Delete, Archive, Restore

- Delete: confirmation modal ("Delete this task? This cannot be undone."). Soft-delete `status='deleted'`. Removed from all views.
- Archive: `status='archived'`, `archived_at` set. Disappears from home; remains in DB (surfaced in search in Milestone 5).
- Restore: archived → active.
- Each writes a history entry.

### 3.5 — Real-time Sync

- `features/tasks/useTasks.ts` subscribes to the `tasks` table filtered by `household_id`.
- Insert/update/delete events reconcile into local state.
- The acting user already sees the change optimistically; this delivers it to the *other* user within seconds.
- Reconciliation must not clobber an in-flight optimistic update on the acting user's screen.

---

## Technical Notes

- **Conflict resolution:** last write wins, per PRD. The `task_history` trail is what makes an accidental overwrite visible and recoverable — so history writes are not optional, they are the safety net.
- **RLS does the security work.** Task CRUD uses the authenticated server client; the policies from migration `002_rls.sql` scope every read/write to the user's household. Service-role is not used here.
- **Optimistic + Realtime reconciliation** is the subtle part. Pattern: tag optimistic updates with a temporary client-side id; when the Realtime echo arrives, match and replace rather than append. Test with two browsers.
- **No global state library.** `useTasks` (Realtime-backed state) + `useTaskMutations` (optimistic writes) are sufficient. Per architecture: prefer React state.

---

## Review Checkpoint

Milestone 3 is complete when:

1. Home screen renders real tasks from Supabase; placeholder file deleted.
2. A task can be created and appears immediately.
3. A task can be opened, edited, and changes auto-save with no save button.
4. Every change writes a `task_history` entry (verify in DB).
5. Delete (with confirmation), archive, and restore all work.
6. A change made in one browser session appears in a second session within seconds.
7. Optimistic updates never flicker or double-apply when the Realtime echo arrives.
8. TypeScript strict — no errors.
9. RLS verified: a task cannot be read or written outside the user's household.

A Milestone 3 Review document is produced before merging. Offline behaviour is **deferred to the end of the roadmap and may be cut entirely** (see Decision 1) — it is not a blocker for any milestone before then.

---

## Deliberately Deferred

| Item | Goes to | Why |
|------|---------|-----|
| Offline queue & "Saving when connected…" | End of roadmap (may be cut) | Online-only decision; revisited only after everything else, subject to go/no-go. |
| Pinning + brass pin + drag-to-reorder | Milestone 3b | Signature interaction; needs focused attention. |
| Checklist / shopping / links / rich-text / history UI | Milestone 4 | Detail-screen sub-features; this milestone builds the detail *shell*. |
| Weather banner | Milestone 4/5 | Depends on Met Office integration. |
| Search | Milestone 5 | Depends on archive being populated. |

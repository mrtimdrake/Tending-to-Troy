# Tending to Troy
## Milestone 3b Implementation Plan
### Phase 3b — Pinning & Manual Ordering
### Branch: `feature/milestone-3b-pinning`

---

## Guiding Philosophy

Two related interactions that complete the home-screen model: **pinning** (keep an important task at the top of its priority) and **manual ordering** (arrange the rest by hand). The signature moment is the **brass drawing pin** — it must feel like pressing a real tack into paper, never cartoonish. Per the engineering plan, the pin visual is prototyped and approved *before* polish, because a cheap-looking pin would undermine the whole design language.

Foundation already in place (Milestone 3): the `tasks` row has `is_pinned` and `manual_order`; the `Task` view-model carries `isPinned` / `manualOrder`; `sortTasks` already orders **pinned first, then by manual order, newest-first on ties**. So this milestone is mostly UI + two small server actions + realtime reflection — no schema change.

---

## Scope

**In scope**
- Pin / unpin a task (toggle), reflected in real time on the other device
- Pinned tasks pinned to the top of their priority group (already sorted; needs the toggle + visual)
- The brass drawing-pin component (prototype → approval → integrate)
- Drag-to-reorder within a priority group (long-press on mobile, click-drag on desktop)
- Persist `manual_order` for the affected rows; order survives reload and syncs to the other user
- Optimistic updates for both, via the existing mutation layer

**Out of scope**
- Moving a task *between* priority groups by drag (priority change stays on the detail screen for now)
- Reordering pinned items relative to each other beyond pin/unpin (pinned block stays newest-first unless trivially included)
- Anything from Milestone 4 (checklist/shopping/links/rich text/history UI)

---

## Decisions to confirm

1. **`manual_order` scheme.** Today new tasks share `manual_order = 0` and sort newest-first. For drag, switch to **explicit spaced integers per priority group** (e.g. 10, 20, 30…) so a single dragged row can be renumbered without rewriting the whole list, and gaps allow insertion. On first drag in a group, normalise that group to spaced values. *(Recommended.)*
2. **Drag library vs. hand-rolled.** Recommend **`@dnd-kit`** (lightweight, accessible, touch + pointer, no legacy deps) over hand-rolling pointer math or the heavier `react-beautiful-dnd` (now unmaintained). One small dependency.
3. **Pin gesture.** Pin/unpin via a tap on the pin affordance on the card (and a control on the detail screen). Not a swipe — swipe is reserved and ambiguous on a scrolling list.

---

## Task Breakdown

### 3b.1 — Pinning (data + behaviour)
- Add `setPinned(id, pinned)` to `features/tasks/actions.ts` — sets `is_pinned`, writes a history entry ("Pinned" / "Unpinned"), returns the row.
- Add `pin/unpin` to `useTaskMutations` with optimistic update (the card jumps to the top of its group immediately; realtime echo confirms; rollback on error).
- Tapping the pin on a card toggles it. Pinned tasks already sort first via `sortTasks`.
- Real-time: the other device reorders within a second (existing `useTasks` subscription already maps `is_pinned`).

### 3b.2 — Brass drawing-pin component (prototype first)
- Build `components/home/BrassPin.tsx` as an isolated, polished SVG drawing pin — small brass tack, subtle metallic shading via flat tokens (no glossy gradients, per design system), not cartoon.
- States: **unpinned** (faint outline affordance / hover hint) and **pinned** (seated tack).
- Animation on pin: slight rotate + settle into the card, **250ms, no bounce/spring** (`--duration-pin`).
- Replaces the current placeholder dot (`PinIndicator`).
- **Checkpoint: present the pin (screenshots + animation) for approval before wider integration/polish.**

### 3b.3 — Drag-to-reorder
- Add `@dnd-kit` (core + sortable). Wrap each `PrioritySection`'s card list in a sortable context (drag scoped *within* a single priority group).
- Long-press to lift on mobile; click-drag on desktop. Subtle shadow lift while dragging; calm drop (reuse motion tokens).
- On drop, compute new `manual_order` for the moved row (and normalise the group to spaced integers on first drag) and persist via a new `reorderTasks` server action (batch update the affected rows + one history entry, e.g. "Reordered").
- Optimistic: list reorders instantly; realtime reflects to the other device; rollback on failure.
- Pinned items stay in the pinned block at the top; dragging applies to the unpinned remainder (and/or pinned block internally — keep simple: reorder within the same pinned/unpinned segment).

### 3b.4 — Realtime + edge cases
- Reorder/pin changes from the other user reconcile without clobbering an in-flight local drag.
- Dragging a task that the other user just archived/deleted: drop is a no-op; reconcile cleanly.
- `manual_order` stays within `integer` range (spaced 10s — no overflow risk like the old `-Date.now()` bug).

---

## Files (anticipated)
```
features/tasks/actions.ts        — + setPinned, + reorderTasks
features/tasks/useTaskMutations.ts — + pin/unpin, + reorder (optimistic)
components/home/BrassPin.tsx      — new (replaces PinIndicator)
components/home/TaskCard.tsx      — pin affordance + drag handle wiring
components/home/PrioritySection.tsx — sortable context per group
package.json                      — + @dnd-kit/core, @dnd-kit/sortable
```

---

## Review Checkpoint
Milestone 3b is complete when:
1. Pin/unpin works and the task moves to/from the top of its group.
2. The brass pin is approved and integrated (no layout shift vs. the old placeholder).
3. Drag-to-reorder is smooth on mobile (long-press) and desktop (click-drag).
4. `manual_order` persists across reload and syncs to the other device.
5. Pin and reorder both reflect in real time without flicker or double-apply.
6. TypeScript strict — no errors; production build green.
7. A Milestone 3b Review document is produced before merge.

---

## Note on UX polish
Per the agreed sequence, the broader UX polish pass comes **after** 3b and Milestone 4 — once the interaction surface is complete and a few days of real Alpha use have shown what actually needs refining. 3b should still meet the design language, but pixel-level polish is deferred.

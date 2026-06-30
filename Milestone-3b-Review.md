# Tending to Troy
## Milestone 3b Review
### Phase 3b — Pinning & Manual Ordering
### Branch: `feature/milestone-3b-pinning`

---

## Objectives

Complete the home-screen interaction model: pin/unpin tasks, the signature brass drawing-pin, and drag-to-reorder within a priority group — all optimistic and synced in real time. No schema change (the data layer already carried `is_pinned` and `manual_order`).

---

## Deliverables

- **Pinning** — `setPinned` server action (writes "Pinned"/"Unpinned" history); `togglePin` in `useTaskMutations` with optimistic re-sort + rollback; pinned tasks sort to the top of their group; reflected live on the other device.
- **Brass pin** — `BrassPin.tsx`, flat two-tone SVG tack, faint outline when unpinned (tap target), seated when pinned, 250ms settle (no bounce). Approved before integration. Replaced the placeholder dot.
- **Drag-to-reorder** — `@dnd-kit` sortable per priority group; `reorderTasks` action persisting spaced `manual_order` (10, 20, 30…); optimistic via `applyOrder` with rollback; synced live.
- Distance (8px desktop) / long-press (200ms mobile) activation so taps navigate and lists still scroll.

---

## Architectural Decisions

1. **Spaced integers for `manual_order`** (10, 20, 30…) — a drag renumbers the group cleanly and stays well within `integer` range (no repeat of the earlier `-Date.now()` overflow).
2. **`@dnd-kit`** over hand-rolled pointer math or the unmaintained `react-beautiful-dnd` — small, accessible, touch + pointer. Adds ~17 kB to the home bundle (87.5 kB / 192 kB First Load) — acceptable.
3. **Reorder scoped within a priority group** — moving between priorities stays on the detail screen for now.
4. **Click-after-drag suppression** — the card is a `Link`; a 250 ms post-drag window cancels the click so a drag never navigates. Pin button uses `stopPropagation`/`preventDefault`.
5. **`animateLayoutChanges` always on** — so a pinned card slides to the top rather than jumping.

---

## Issues Found & Fixed (during user testing)

- **Drag opened the task on release** — the post-drop click hit the underlying `Link`. Fixed with a capture-phase click suppressor keyed to the last drag-end time.
- **No slide animation on pin** — dnd-kit only animates during drags by default; enabled layout-change animation always.

---

## Deviations from PRD / Plan

None. Reordering between priority groups by drag was explicitly out of scope (priority change remains on the detail screen).

---

## Known Issues / Notes

- Dragging a **pinned** card reassigns `manual_order` but it stays in the pinned block (pinned is the primary sort key) — expected, not a bug.
- Reorder writes one history entry ("Reordered") on the first affected task — sufficient for the trail; not a per-row audit.
- No automated tests yet (carried over) — sort/pin/reorder logic is the prime candidate.
- `realtime.setAuth` still set once on mount (token-refresh re-set deferred; fine for 1-hour sessions).

---

## Recommendation

**READY TO MERGE.** Pinning, the brass pin, and drag-to-reorder are verified working by the user; production build is green; TypeScript strict passes. Merging deploys to the live Alpha automatically.

Next: **Milestone 4** (detail sub-features — checklist, shopping list, links, rich text, history timeline UI), then the broader **UX polish pass** as agreed.

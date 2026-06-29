# Tending to Troy
## Milestone 2 Review
### Phase 2 — Core Layout & Navigation
### Branch: `feature/milestone-2-layout`
### Date: 29 June 2026

---

## Objectives

Milestone 2 set out to establish the **design foundation** for Tending to Troy — not the finished visual product. The chosen direction is The Household Journal (Direction 1), treated explicitly as Version 1 of the design language. The goal was a clean, extensible, well-structured home screen that can be refined through real use without architectural change.

No feature data is connected in this milestone. The interface is built against realistic placeholder content.

---

## Deliverables

**New components**
- `components/layout/Navigation.tsx` — sticky top bar: app name (Geist 600), italic tagline (Source Serif 4), search + profile icons at 44px touch targets, iOS safe-area inset respected.
- `components/layout/HomeLayout.tsx` — page shell, content column max-width 680px, centred.
- `components/home/PrioritySection.tsx` — collapsible section, Source Serif 4 italic label, measured `max-height` animation, chevron rotation, empty state ("Nothing here yet.").
- `components/home/TaskCard.tsx` — ivory index card, serif title, hover shadow lift, active press scale, no tap-highlight flash.
- `components/home/TaskCardBadge.tsx` — location + owner badges (moss / slate / terracotta / brass / navy).
- `components/home/PinIndicator.tsx` — brass dot placeholder, reserves space for the Phase 3b pin.
- `components/home/ShoppingIndicator.tsx` — brass basket icon, right-aligned.

**New hook**
- `hooks/useSectionState.ts` — localStorage-backed open/collapsed state, P1 + P2 open by default.

**Placeholder data**
- `lib/placeholder/tasks.ts` — 8 realistic tasks across all four priorities; shape mirrors the future `tasks` row so Phase 3a can swap in real data with no component changes.

**Updated**
- `app/home/page.tsx` — renders `HomeLayout` + four `PrioritySection`s; auth check and invitation panel preserved.
- `lib/auth/actions.ts` — registration now uses the admin client with `email_confirm: true` (see Architectural Decisions).
- `app/home/InvitationPanel.tsx` — origin resolved after mount (hydration fix).
- `.gitignore` — credential files excluded.

**Dependency added**
- `lucide-react` — icon set (search, profile, chevron, basket).

---

## Architectural Decisions

1. **Server-side auto-confirm on registration.** Supabase email confirmation is enabled by default on new projects, which blocked sign-in after registration. Both registration actions now create the auth user via `admin.auth.admin.createUser({ email_confirm: true })`. This makes registration reliable regardless of the dashboard setting and matches the documented V1 decision (email confirmation intentionally off for a private two-person app). **Must be revisited before any public release.**

2. **Badge colours via inline styles, not Tailwind opacity classes.** Dynamically constructed classes (`bg-moss/20`) are not detectable by the Tailwind compiler and rendered grey. Switched to inline style objects. A future refinement could move these to a typed token map or a Tailwind safelist.

3. **Hydration-safe client state.** Both `useSectionState` and `InvitationPanel` now render the SSR default first and sync browser-only values (`localStorage`, `window.location.origin`) in `useEffect` after mount. This is the correct pattern; the only cost is a brief settle on first paint for a previously-collapsed section.

4. **`lucide-react` for icons.** Lightweight, tree-shakeable, no runtime cost beyond used icons. Keeps icon usage consistent and avoids hand-rolled SVG.

---

## Deviations from PRD

None of substance. The PRD describes the home screen, card anatomy, and collapsible priority sections — all implemented. Items intentionally deferred (per the Milestone 2 plan, not deviations):

- Pin is a placeholder dot; the brass skeuomorphic drawing pin is Phase 3b.
- Search and profile icons are non-interactive (Phase 5 / Phase 7).
- No drag-to-reorder, no task creation, no task detail screen — later phases.
- No real data — placeholder only.

---

## Known Issues

- **Brief section flash on first paint.** A previously-collapsed section renders open for one frame before settling to its stored state. Acceptable and barely perceptible; a cookie-based approach could eliminate it if desired.
- **Invitation panel prominence.** It currently sits at the top of the home screen and is visually heavy. Fine for the two-person setup phase, but worth relocating/quieting once the second user has joined.
- **Responsive verification not automated.** Layout reasoned as safe (mobile-first, single column, max-width 680px, `flex-wrap` on badges). Recommend a manual pass at 375 / 390 / 768 / 1280px on the live dev server before close.

---

## Risks

- **Supabase credentials were shared in plain text** (chat + a local `credentials.txt`, now git-ignored). **Recommendation: rotate the anon and service-role keys** in the Supabase dashboard, since they have appeared in a conversation log.
- **Email confirmation disabled** — correct for V1, but a release blocker if the app ever goes public. Tracked.
- **No automated tests yet.** Acceptable at this stage but accruing; worth introducing before the data layer lands in Phase 3a.

---

## Recommendation

**READY TO MERGE** into `main`, subject to two operational confirmations:

1. Rotate the Supabase keys that were shared in chat.
2. Do a quick manual responsive pass (375 / 390 / 768 / 1280px) on the running app.

The foundation is clean, typed, hydration-safe, and structured so that real data (Phase 3a) and interaction (drag, pin animation, task detail) can be layered on without rework. It meets the milestone's stated intent: a beautiful, extensible Version 1 of the design language — not a finished product.

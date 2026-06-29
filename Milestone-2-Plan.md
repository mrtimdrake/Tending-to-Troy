# Tending to Troy
## Milestone 2 Implementation Plan
### Phase 2 — Core Layout & Navigation
### Branch: feature/milestone-2-layout

---

## Guiding Philosophy

The objective of Milestone 2 is to establish the design foundation — not to deliver the finished product.

The chosen direction is **The Household Journal** (Direction 1), but this should be treated as Version 1 of the design language rather than its final form. Typography, spacing, hierarchy, animation, and interaction details are expected to evolve as the application is used in real life. The design will be refined through use, not anticipated in advance.

When this milestone is complete, a user who opens the app on their phone should immediately feel:

> This is not another app. This is something someone made for their home.

That feeling should be present in the foundation. It does not need to be perfected.

**Optimise for a clean, extensible, beautifully structured foundation** that can be refined over time without requiring architectural changes. This means:

- Design tokens centralised in CSS variables — spacing, colour, radius, shadow, and motion can be updated in one place
- Components that accept their content as props with no hard-coded copy
- No layout assumptions baked into components that would resist future refinement
- Animations implemented correctly but kept simple — smoothness matters more than elaborateness at this stage

**When uncertain between polishing visuals further or moving the product forward:** choose the path that preserves design quality while allowing progress. A component that is 90% right and ships is more valuable than one that is 95% right and delays Milestone 3.

No feature data is connected in this milestone. Everything uses realistic placeholder content.

---

## Scope

**In scope:**
- Navigation bar (name, tagline, search icon, profile icon)
- Home screen with four collapsible priority sections
- Task card component
- Responsive layout (mobile-first, centered on desktop)
- Section open/collapsed state (persisted in localStorage)
- Placeholder task data (hardcoded, realistic)
- Typography verification (correct fonts, correct weights, correct sizes)
- Colour verification against design system
- Motion (section expand/collapse only)

**Out of scope:**
- Real data from Supabase
- Task creation, editing, deletion
- Search functionality (icon placeholder only)
- Pinning interaction (placeholder only on cards)
- Drag-to-reorder
- Task detail screen
- Authentication-dependent content (home screen renders for a logged-in user — auth is already complete)

---

## Design Principles for This Milestone

Before writing a single component, the following decisions should guide all implementation choices:

**Cards are index cards, not tiles.**
They should feel like premium stationery — generous internal padding, soft warm shadow, no hard borders. The card surface is ivory (#FFFDF6). The paper behind the cards is the warm yellow (#F5E8A8). The contrast between card and background is the visual foundation of the entire interface.

**Typography does the heavy lifting.**
The task title is set in Source Serif 4 — the body typeface — not a heading font. This is deliberate. It gives each card a handwritten, recorded feeling rather than a bold label. Priority section headings use Geist at a quieter weight and size than one might expect.

**White space is a feature.**
Cards have generous padding. Sections have generous vertical separation. The instinct to reduce spacing to fit more on screen should be actively resisted. The interface should never feel crowded.

**Animation is restraint.**
Section expand/collapse uses a smooth height transition at 180ms with the default easing curve. No bounce. No spring. No overshoot. The animation should feel like paper unfolding, not a UI widget snapping open.

**Mobile is the primary viewport.**
All layout decisions are made for a 390px viewport (iPhone 15 Pro) first. Desktop is a centered, max-width version of the same layout — not a different layout.

---

## Folder Structure for This Milestone

New files will be added under:

```
/components
  /layout
    Navigation.tsx          — top bar
    HomeLayout.tsx          — wraps the home screen content
  /home
    PrioritySection.tsx     — collapsible section with header and card list
    TaskCard.tsx            — individual task card
    TaskCardBadge.tsx       — indoor/outdoor and owner chips
    PinIndicator.tsx        — placeholder pin mark (no interaction yet)
    ShoppingIndicator.tsx   — dot or icon shown when task has shopping items
/hooks
    useSectionState.ts      — localStorage-backed open/collapsed state per section
/lib
  /placeholder
    tasks.ts                — realistic hardcoded placeholder tasks
```

The `features/` directory (noted in the Technical Architecture) will be introduced in Phase 3a when real data and mutations are added. Phase 2 does not need it.

---

## Task Breakdown

### 2.1 — Placeholder Data

Before any UI is built, define the placeholder task data that will be used throughout this milestone.

**File:** `lib/placeholder/tasks.ts`

Create 6–8 realistic placeholder tasks across all four priority groups, with a mix of owners, indoor/outdoor locations, some pinned, some with shopping indicators. These should feel like real household tasks — not developer lorem ipsum.

Example tasks:
- "Stain the back decking" — Priority 1, Outdoor, Anyone, has shopping items
- "Replace the kitchen tap washers" — Priority 1, Indoor, Tim
- "Order a new garden hose" — Priority 2, Outdoor, Wife, has shopping items
- "Sort the utility room shelving" — Priority 2, Indoor, Anyone
- "Repot the bay trees" — Priority 3, Outdoor, Wife
- "Touch up the hallway paint" — Priority 3, Indoor, Tim
- "Clean the log cabin roof" — Priority 4, Outdoor, Anyone
- "Organise the tool shed" — Priority 4, Outdoor, Tim, pinned

The data should use the same shape as the `tasks` table `Row` type (or a simplified subset) so that swapping in real Supabase data in Phase 3a requires no component changes.

---

### 2.2 — Navigation Bar

**File:** `components/layout/Navigation.tsx`

**Specification:**

The navigation bar is the quietest part of the interface. It carries the application identity without competing with the task content below.

```
┌────────────────────────────────────────────────────────┐
│  Tending to Troy            [🔍]  [person icon]        │
│  Care for our home.                                     │
└────────────────────────────────────────────────────────┘
```

- Application name: Geist, 600 weight, navy. Not large — this is a persistent header, not a hero.
- Tagline: Source Serif 4, regular, slate. Slightly smaller than the name.
- Search icon: right-aligned, 44×44 touch target. Brass colour. No interaction in this milestone — `onClick` prop is wired to a no-op.
- Profile icon: right-aligned, 44×44 touch target. Navy. No interaction in this milestone.
- Background: ivory (#FFFDF6), not paper yellow. The nav sits on a slightly cooler surface than the page behind it.
- Bottom border: 1px, `navy/10`. Subtle — not a hard line.
- Top safe-area: respect iOS safe area inset using `env(safe-area-inset-top)`.
- Position: sticky to the top of the viewport. The page scrolls beneath it.
- Max-width: the nav content aligns with the content max-width (680px), centered. On mobile the full width is used.

**No hamburger menu. No drawer. No mobile navigation pattern.** The application has no top-level routes to navigate between in Version 1. The nav is identity + utility icons only.

---

### 2.3 — Home Screen Layout

**File:** `app/home/page.tsx` (update existing) and `components/layout/HomeLayout.tsx`

The home screen is a single vertical column of four priority sections.

Layout:
- Page background: paper yellow (#F5E8A8)
- Content column: max-width 680px, centered with `mx-auto`, horizontal padding 16px mobile / 24px desktop
- Vertical padding: 24px top (below nav), 40px bottom (thumb-reach clearance on mobile)
- Gap between priority sections: 24px

The home page server component already checks auth and redirects. Update it to render `HomeLayout` with placeholder tasks.

---

### 2.4 — Priority Section

**File:** `components/home/PrioritySection.tsx`

This is the most important component in Phase 2.

**Specification:**

Each section has a header row and a collapsible body.

**Header row:**
```
Priority 1                              ▸  (5)
```
- Label: Geist, 500 weight, 0.75rem, slate. Not loud. The priority label is a quiet organiser.
- Count: slate, same size, shown in parentheses next to the collapse icon.
- Collapse icon: a subtle chevron (▸ collapsed, ▾ expanded). Rotates 90° on expand — CSS transform, `duration-pin` (250ms). The entire header row is the tap target, minimum 44px height.
- No divider lines between the header and the cards. The spacing is the separator.

**Body:**
- Smooth height animation on open/close. Use a CSS max-height transition or a `<details>`-equivalent approach. The animation should feel like the section breathing open, not a UI widget toggling.
- Recommended approach: measure content height with a `useRef`, set `max-height` via inline style between 0 and the measured value. Transition duration: 180ms, `easing-default`. Avoid `overflow: visible` during transition (clips correctly).
- When collapsed, cards are hidden but remain in the DOM (not unmounted) — this preserves scroll position and avoids remount flicker.

**Open/collapsed state:**
- Default: Priority 1 open, Priority 2 open, Priority 3 collapsed, Priority 4 collapsed
- State persisted in `localStorage` via `useSectionState` hook
- Key: `ttt-section-{priority}` (namespaced to avoid collisions)
- Initialise from localStorage on first render; update localStorage on every toggle

**Empty state:**
- If a section has no tasks: show a single line in slate, Source Serif 4 italic — *"Nothing here yet."* — with the same card padding as a normal card row.
- Do not hide the section. All four sections are always visible.

---

### 2.5 — Task Card

**File:** `components/home/TaskCard.tsx`

This is the second most important component. It must feel like a premium index card.

**Specification:**

```
┌─────────────────────────────────────────────────────────┐
│  Stain the back decking                         📌      │  ← title + pin
│                                                          │
│  [Outdoor]  [Anyone]                   [🛒 Shopping]    │  ← badges
└─────────────────────────────────────────────────────────┘
```

**Card container:**
- Background: ivory (#FFFDF6)
- Border radius: `var(--radius-card)` (20px)
- Shadow: `var(--shadow-card)` — `0 2px 12px rgba(16, 42, 67, 0.07)`
- Padding: 16px horizontal, 14px vertical
- No border

**Title:**
- Font: Source Serif 4, regular (400), 1rem
- Colour: navy (#102A43)
- Line height: 1.4
- Max 2 lines — overflow with ellipsis on line 3+. Do not truncate to 1 line; some task titles are naturally longer.

**Pin indicator:**
- Positioned top-right of the card
- Phase 2: a simple placeholder — a small brass-coloured dot or a minimal skeuomorphic pin SVG without animation
- The full brass drawing pin with animation is a Phase 3b deliverable. Do not build it now.
- The pin placeholder must reserve the same space as the final pin so that implementing it in 3b does not cause layout shift.

**Badges row:**
- Rendered below the title with 8px gap
- Indoor/Outdoor badge: small pill, moss green (#7E9F79) background, ivory text for Outdoor; slate (#5B6C80) background, ivory text for Indoor
- Owner badge: same pill style, terracotta (#C97A52) background for Tim, brass (#B48A3D) for Wife, navy/20 background with navy text for Anyone
- Shopping indicator: right-aligned in the badges row. A small basket icon (or shopping bag icon) in brass. Only shown if the task has shopping items.
- Badge text: Inter, 500 weight, 0.75rem, 10px horizontal padding, 4px vertical padding

**Interactivity:**
- Entire card is tappable (will navigate to task detail in Phase 4)
- Hover state (desktop): slight shadow lift (`var(--shadow-lift)`) — 180ms transition
- Active state (mobile): `scale(0.98)` — 120ms transition. Feels like pressing the card.
- No tap highlight flash (`-webkit-tap-highlight-color: transparent`)

**Card spacing:**
- Gap between cards within a section: 10px
- Do not use a list container with margins — use a flex column with `gap`.

---

### 2.6 — `useSectionState` Hook

**File:** `hooks/useSectionState.ts`

```ts
function useSectionState(priority: 1 | 2 | 3 | 4): [boolean, () => void]
```

Returns `[isOpen, toggle]`.

- Default open: priorities 1 and 2
- Default collapsed: priorities 3 and 4
- Reads from `localStorage` on mount (handle SSR — `localStorage` is not available during server render)
- Writes to `localStorage` on every toggle
- Uses `useState` with a lazy initialiser to avoid hydration mismatch

---

### 2.7 — Responsive Layout Verification

This is not optional. Before this milestone is closed, the layout must be verified at:

- **390px** (iPhone 15 Pro — primary target)
- **375px** (iPhone SE — smallest common iOS viewport)
- **414px** (iPhone Plus — widest common iOS viewport)
- **768px** (iPad — secondary)
- **1280px** (Desktop — centered, max-width)

Checks at each viewport:
- No horizontal overflow
- Cards fill the available width correctly
- Badge text does not overflow card width
- Navigation icons remain 44px touch targets
- Section headers remain tappable at 44px minimum height
- Tagline in nav wraps gracefully on narrow widths

---

### 2.8 — Typography Audit

Before the milestone review, confirm:

- Application name renders in Geist at 600 weight (headings use `font-heading`)
- Tagline renders in Source Serif 4 (body copy uses `font-body`)
- Navigation icons and badge text render in Inter (`font-ui`)
- Task title renders in Source Serif 4 regular
- Priority section labels render in Geist 500
- No fallback font rendering (verify font loaded, not Times New Roman or Arial)
- `font-display: swap` is working — text renders immediately in the fallback, then swaps to the loaded font

---

## Component Hierarchy

```
app/home/page.tsx (server component — auth check, passes placeholder data)
  └── HomeLayout
        ├── Navigation
        └── <main>
              ├── PrioritySection (priority=1)
              │     ├── TaskCard
              │     └── TaskCard (pinned)
              ├── PrioritySection (priority=2)
              │     └── TaskCard
              ├── PrioritySection (priority=3, collapsed)
              │     └── TaskCard
              └── PrioritySection (priority=4, collapsed)
                    └── TaskCard
```

---

## What Good Looks Like

When Milestone 2 is complete, the home screen should feel like a considered starting point — warm, clear, and structurally sound. It will not be finished. That is intentional.

Specific checks:
- The background and card surface create immediate warmth and distinguish this from a generic productivity tool
- Task titles are set in a serif face that gives each card an intentional, recorded quality
- Priority section labels are quiet — they organise without competing
- Collapsed sections feel deliberate, not broken
- Section expand/collapse is smooth and physically credible
- The design system tokens (colour, spacing, radius, shadow, motion) are all in CSS variables and working correctly
- The components accept props cleanly — nothing is hard-coded that should be dynamic

The question is not "does this look perfect?" The question is "is this a foundation we would be proud to build on?"

---

## What Is Deliberately Not Built

The following will be needed and could be tempting to add early. Do not:

- **Search:** The search icon appears in the nav but has no interaction. The search UI is Phase 5.
- **Floating action button / create task button:** Not in this milestone. The PRD specifies task creation; the UX pattern for it has not been designed yet.
- **Sign out:** The profile icon is a placeholder. Sign-out UI is Phase 7.
- **Real data:** No Supabase queries. All tasks are hardcoded placeholders.
- **Drag handles:** The cards are not draggable in this milestone.
- **Brass pin animation:** A placeholder mark only. The full pin is Phase 3b.

Scope discipline is as important as implementation quality.

---

## Review Checkpoint

Milestone 2 is complete when:

1. Home screen renders with all four priority sections
2. Sections expand and collapse with smooth animation
3. Open/collapsed state persists across page reloads
4. Task cards display title, owner badge, indoor/outdoor badge, shopping indicator, and pin placeholder
5. Layout is verified correct at 390px, 375px, 768px, and 1280px
6. Typography audit passed — correct fonts at correct weights, no fallbacks visible
7. Colours match the design system
8. No horizontal overflow at any viewport
9. TypeScript strict — no errors
10. The interface feels calm, warm, and genuinely premium

A Milestone 2 Review document must be produced before merging.

---

## Known Dependencies on Phase 1

- Design tokens, CSS variables, and font loading are already complete — do not re-implement
- Auth is complete — `app/home/page.tsx` already checks the session and redirects if unauthenticated
- `components/ui/Button.tsx` and `components/ui/Input.tsx` exist — do not duplicate

---

## Technical Notes

**Section collapse animation — recommended approach:**

```tsx
// Measure content height once and drive max-height transition
const contentRef = useRef<HTMLDivElement>(null)
const [contentHeight, setContentHeight] = useState(0)

useEffect(() => {
  if (contentRef.current) {
    setContentHeight(contentRef.current.scrollHeight)
  }
}, [tasks]) // recalculate if task count changes

<div
  style={{
    maxHeight: isOpen ? contentHeight : 0,
    overflow: 'hidden',
    transition: `max-height var(--duration-card) var(--easing-default)`,
  }}
>
  <div ref={contentRef}>
    {/* cards */}
  </div>
</div>
```

This is more reliable than `grid-template-rows: 0fr / 1fr` (which has inconsistent browser support) and more correct than animating `height` (which requires knowing the target value).

**SSR-safe localStorage for `useSectionState`:**

```ts
const [isOpen, setIsOpen] = useState<boolean>(() => {
  if (typeof window === 'undefined') return priority <= 2
  const stored = localStorage.getItem(`ttt-section-${priority}`)
  return stored !== null ? stored === 'true' : priority <= 2
})
```

The lazy initialiser runs only on the client, so there is no hydration mismatch.

**Avoiding `-webkit-tap-highlight-color` flash on cards:**

```css
/* In globals.css or as a Tailwind utility */
.tap-transparent {
  -webkit-tap-highlight-color: transparent;
}
```

Apply to the card container. Without this, iOS renders a grey flash on tap that breaks the premium feel.

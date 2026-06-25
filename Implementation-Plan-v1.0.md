# Tending to Troy
## Implementation Plan
### Version 1.0

---

## Overview

This plan is derived from the Claude Engineering Guide (v1.0) and revised against the concerns identified during architecture review. Changes from the original Guide's 8-phase roadmap are marked **[Revised]**.

The build sequence is designed so that each phase produces something working and reviewable. No phase begins until the previous phase has been reviewed and approved.

---

## Phase 1 — Foundation
*Estimated scope: medium. Must be complete and solid before anything else is built.*

### Goals
- Working repository, deployment pipeline, and authentication.
- Invitation flow fully implemented.
- Design tokens and typography in place.
- RLS policies defined and verified.

### Tasks

**1.1 — Repository & Deployment**
- Create GitHub repository.
- Initialise Next.js project with TypeScript (strict mode).
- Configure Tailwind CSS.
- Connect Vercel. Confirm automatic deploy on push to `main`.
- Add `.env.example` with all required environment variable names (no values).

**1.2 — Design Tokens [Revised]**
- Implement the full colour palette as Tailwind custom tokens (paper yellow, warm ivory, deep navy, slate blue, muted brass, soft moss, muted terracotta).
- Configure `next/font` for Geist and Source Serif 4. Latin subset only. `font-display: swap`. Load only used weights.
- Set global corner radius, shadow, and motion duration values as CSS variables.
- *Rationale: font loading strategy must be settled in Phase 1, not deferred to polish. Missing this creates a gap between the design target and what renders on first load.*

**1.3 — Supabase Setup**
- Create Supabase project.
- Define all database tables as per the Technical Architecture (v1.1).
- Enable RLS on every table.
- Write and test all RLS policies before any application code reads or writes data.
- Verify: a user cannot read rows from a household they do not belong to.

**1.4 — Authentication [Revised]**
- Implement email/password registration and sign-in via Supabase Auth.
- Implement the full invitation flow:
  - First user registration creates household row and generates invitation token.
  - Invitation link generation (token embedded in URL).
  - Second user registration validates token server-side, joins household, marks token used.
  - Token regeneration if second user has not yet joined.
  - Hard block on further registrations once both users have joined.
- *Rationale: the original Guide treated invitation as implicit within "authentication". It is a distinct feature with its own logic and failure modes. Leaving it underspecified risks an incomplete or insecure onboarding flow.*

### Review checkpoint
- Both users can register via the invitation flow.
- RLS policies verified: neither user can access a different household's data.
- Design tokens render correctly on a blank page (typography, colours, corner radii).
- Deployment pipeline confirmed working.
- Present: screenshots, RLS test evidence, any architectural questions.

---

## Phase 2 — Core Layout & Navigation
*Estimated scope: medium.*

### Goals
Working home screen with all four priority sections, correct typography, colours, and responsive layout. No real data yet — use realistic placeholder tasks.

### Tasks

**2.1 — Navigation**
- Top bar: application name, tagline, search icon, profile icon.
- Responsive layout (single column on mobile, max-width centered on desktop).

**2.2 — Home Screen**
- Four collapsible priority sections.
- Each section remembers open/collapsed state.
- Task card component: title, owner chip, indoor/outdoor chip, shopping indicator, pin icon placeholder.
- Generous card spacing. Warm ivory card surface. Soft shadow only.

**2.3 — Responsive Layout**
- Verify on iPhone viewport.
- Verify on desktop (centered, max-width).
- No horizontal scrolling at any viewport.

### Review checkpoint
- Home screen matches the design system visually.
- Correct typefaces rendering at correct weights.
- Collapsible sections working.
- Responsive on phone and desktop.
- Present: screenshots (mobile and desktop), any typography/colour deviations noted.

---

## Phase 3a — Core Task CRUD
*Estimated scope: medium. Deliberately scoped smaller than the original Phase 3.*

### Goals
Tasks can be created, read, edited, deleted, and archived. Real data. Real-time sync between two sessions. Auto-save working.

### Tasks

**3.1 — Task Creation**
- Create task form: title, priority, owner, location.
- Saves to Supabase. Appears on home screen immediately via Realtime.

**3.2 — Task Editing**
- Task detail screen: all fields editable.
- Auto-save on every change (debounced — no save button).
- Every save writes a `task_history` entry with timestamp and user.

**3.3 — Delete & Archive**
- Delete: requires confirmation modal. Soft-delete (status = 'deleted').
- Archive: status = 'archived'. Task disappears from main view but is searchable.
- Restore: archived tasks can be returned to active.

**3.4 — Real-time Sync**
- Changes made by one user appear on the other user's screen within seconds.
- No manual refresh required.
- Verify with two browser sessions simultaneously.

**3.5 — Offline Queue [Revised]**
- Detect network availability.
- When offline: queue edits in localStorage.
- Show subtle persistent "Saving when connected..." indicator.
- On reconnection: flush queue in order. If flush fails, show plain-English retry prompt.
- *Rationale: the PRD states "never lose user input" and targets a PWA used around the home where signal may drop. Deferring offline handling creates a gap between the stated requirement and actual behaviour.*

### Review checkpoint
- Full task lifecycle working (create → edit → archive → restore → delete).
- Real-time sync verified between two sessions.
- Offline queue demonstrated: edit while offline, reconnect, verify edit appears.
- Auto-save confirmed (no save button).
- History entries written on every save.
- Present: short demo walkthrough, any sync edge cases observed.

---

## Phase 3b — Pinning & Manual Ordering
*Estimated scope: small-to-medium. Separated from 3a because drag-to-reorder needs focused attention.*

### Goals
Pinning and drag-to-reorder working correctly. Brass pin interaction prototyped and approved before the polish phase.

### Tasks

**3b.1 — Pinning**
- Pin/unpin toggle on task cards.
- Pinned tasks sort to the top of their priority group.
- Pinning is a real-time update — the other user's screen reorders immediately.

**3b.2 — Brass Pin Prototype [Revised]**
- Build the brass skeuomorphic drawing pin as an isolated component.
- Pin should appear as a small, polished brass tack — not cartoon, not glossy. Subtle metallic treatment.
- Pinning animation: pin rotates slightly, drops into card (250ms, no bounce, no spring).
- Present the prototype for approval before continuing.
- *Rationale: the pin is called out as a signature interaction. A visual that reads as cheap or cartoonish undermines the entire design language. Discovering it doesn't work in the polish phase means rebuilding under time pressure. Build it now while Phase 3b is already touching this area.*

**3b.3 — Drag-to-Reorder**
- Long-press to lift a card (mobile). Click-drag on desktop.
- Smooth 60fps drag. Subtle shadow lift. Natural drop.
- Updates `manual_order` for affected rows only.
- Order persists and syncs to the other user's session.

### Review checkpoint
- Pinning working and syncing in real time.
- Brass pin visual approved.
- Drag-to-reorder smooth on both mobile and desktop.
- Manual order persists across sessions and page reloads.
- Present: pin component screenshots and animation demo, reorder demo.

---

## Phase 4 — Task Detail
*Estimated scope: medium.*

### Goals
Full task detail screen with all sub-features: checklist, shopping list, links, notes, history.

### Tasks

**4.1 — Rich Text (Description & Notes)**
- Markdown editing and rendering.
- Supported: headings, bold, italic, bullet lists, numbered lists, hyperlinks.
- No complex formatting. Use a lightweight editor (e.g. a simple Markdown input with preview, or a constrained rich-text editor).

**4.2 — Checklist**
- Add, complete, and reorder checklist items.
- Drag-to-reorder within the checklist.
- Syncs in real time.

**4.3 — Shopping List**
- Add items with optional quantity.
- Tick items independently.
- Syncs in real time.

**4.4 — Links**
- Add a URL with an optional title.
- Opening a link uses the device browser.
- Reorder links.

**4.5 — History**
- Display the task's history trail from `task_history`.
- Show: who made a change and when.
- Plain English, not raw field diffs.

### Review checkpoint
- All sub-features working on task detail.
- Rich text renders correctly.
- Checklist and shopping items sync in real time.
- History trail accurate.
- Present: full task detail screenshots, any UX concerns noted.

---

## Phase 5 — Search
*Estimated scope: small.*

### Goals
Fast, client-side task title search. Archived tasks included and labelled.

### Tasks

**5.1 — Search Input**
- Search icon in navigation opens a search input.
- Filters task list as user types (client-side, instant).
- Matches against task title.
- Archived tasks appear in results with an "Archived" label.
- Empty state: "No matching tasks."

### Review checkpoint
- Search working across all task statuses.
- Instant response — no network call required for search.
- Empty state correct.
- Present: screenshots.

---

## Phase 6 — Weather
*Estimated scope: small-to-medium.*

### Goals
Weather banner on Outdoor tasks. Met Office API integrated server-side. Correct threshold logic.

### Tasks

**6.1 — Met Office Integration**
- Server-side Next.js API route fetches forecast for household location.
- API key stored in Vercel environment variables only — never in client code.
- Assess the next 3 hours: precipitation probability ≥ 40% OR weather type code indicating rain/sleet/snow/heavy showers triggers warning state.
- Cache response for 30 minutes.
- If API is unavailable, return `unavailable` state — banner is hidden, no error shown to user.

**6.2 — Weather Banner**
- Displayed only on Outdoor task detail screens.
- Warning state: "Rain may make this task difficult."
- Suitable state: "Weather suitable."
- Unavailable: banner hidden.
- Small, rounded, unobtrusive.

### Review checkpoint
- Weather banner appears only on Outdoor tasks.
- Correct state shown based on forecast data.
- API key confirmed not exposed to client.
- Failure state tested (banner hidden gracefully).
- Present: screenshots of both states, evidence of server-side API call.

---

## Phase 7 — Polish
*Estimated scope: medium.*

### Goals
Animations, transitions, loading states, accessibility pass, responsive improvements. No new features.

### Tasks

**7.1 — Animations & Transitions**
- Card transitions: 180ms.
- Button feedback: 120ms.
- Page transitions: 220ms.
- Priority section expand/collapse: smooth.
- No bouncing, no spring effects, no dramatic movement.
- Pin animation already built in Phase 3b — verify it still works correctly here.

**7.2 — Loading States**
- Skeleton loaders for initial task list load.
- Subtle inline saving indicator on task detail.
- Offline banner.

**7.3 — Accessibility**
- Minimum 44px touch targets throughout.
- All interactive elements keyboard accessible on desktop.
- Colour contrast meets WCAG AA.
- Screen reader labels on icon-only buttons.
- Dynamic text sizing supported.
- Landscape layout verified.

**7.4 — Responsive Review**
- Full pass on iPhone, Android (emulated), and desktop.
- No horizontal scrolling at any viewport.

### Review checkpoint
- Animations feel subtle, not distracting.
- Accessibility audit passed.
- Responsive on all target viewports.
- Present: screen recordings of key interactions (create task, pin, drag, search, weather).

---

## Phase 8 — Testing & QA
*Estimated scope: medium.*

### Goals
Unit and integration test suite. Manual QA pass against the full quality checklist from the Engineering Guide.

### Tasks

**8.1 — Unit Tests**
- Priority ordering logic.
- Pinning sort logic.
- Manual order recalculation on drag.
- Client-side search filter.
- Weather state derivation (test all threshold conditions).
- Offline queue flush logic.
- Invitation token validation.

**8.2 — Integration Tests**
- Create task.
- Edit task (single user).
- Simultaneous edit (verify history entry written, last write wins).
- Delete task (confirmation required).
- Archive / restore.
- Real-time sync across two sessions.
- Invitation flow end-to-end.
- Offline edit → reconnect → sync verified.

**8.3 — Manual QA**
Run through the full quality checklist from the Engineering Guide:
- Authentication works.
- Tasks synchronise correctly.
- Priority movement functions.
- Pinning works.
- Archive works. Restore works.
- Search works (including archived tasks).
- Weather functions (both states, and graceful failure).
- Shopping lists work.
- Links open correctly.
- Auto-save functions. No save button anywhere.
- Responsive layout works on iPhone.
- PWA installs correctly from browser.
- Performance feels excellent (load, navigation, drag).
- Typography and colours match the design system.
- Animations feel subtle.
- Accessibility requirements met.
- No obvious bugs.

### Final review checkpoint
Provide a written summary confirming each item above. Note any known limitations or deferred issues.

---

## Definition of Done

Version 1 is complete when:

- The application feels calm.
- The interface feels handcrafted.
- The software disappears into the background.
- Users instinctively understand how to use it without needing instructions.

Opening Tending to Troy should feel like opening a trusted household journal rather than launching another app.

The guiding principle for every decision is simple: **Care for our home.**

---

## Summary of Changes from the Original Engineering Guide

| Area | Original | Revised |
|---|---|---|
| Invitation flow | Implicit within authentication | Explicit feature with full flow, token design, and edge cases defined |
| Design tokens / fonts | Deferred to polish (Phase 7) | Phase 1 — must be settled before layout work begins |
| RLS policies | Mentioned but unspecified | Defined in detail; must be verified before any feature build |
| Phase 3 | Single phase (task system) | Split into 3a (CRUD + sync + offline) and 3b (pin + drag-order) |
| Brass pin prototype | End of project polish | Phase 3b — built and approved before continuing |
| Offline behaviour | "May be deferred" | Required in Phase 3a; queue-and-flush approach specified |
| Simultaneous editing | Not addressed | Last-write-wins with mandatory history logging; no user warning |
| Weather threshold | Unspecified | Defined: 3-hour window, ≥40% precipitation probability or rain weather code |
| Font loading | Not addressed | `next/font`, Latin subset, `font-display: swap`, used weights only |

# Tending to Troy
## Product Requirements Document (PRD)
### Version 1.1

---

**Tagline**
Care for our home.

---

## Vision

Tending to Troy is a private application built specifically for two people to care for their home together.

It is not intended to be a productivity platform, project management tool or corporate task manager. Instead, it is a calm, beautifully designed household companion that stores every task, project, shopping item and note relating to the care of a home.

The application should feel like opening a premium household notebook rather than launching software.

Every feature should reinforce one simple philosophy:

> A home is cared for continuously, not managed by deadlines.

---

## Core Philosophy

The application deliberately rejects many conventions found in modern productivity software.

There are:
- No due dates.
- No deadlines.
- No productivity scores.
- No streaks.
- No gamification.
- No urgency notifications.

Instead, users simply organise tasks into four priority groups. Priority reflects importance rather than time. Users work through these priorities whenever they have time available.

The application should reduce mental load rather than increase it.

---

## Users

Version 1 supports exactly two users. Each user has equal permissions. There are no administrator accounts.

Each user can:
- Create tasks.
- Edit tasks.
- Delete tasks.
- Archive tasks.
- Restore archived tasks.
- Pin tasks.
- Move priorities.
- Complete tasks.

Changes should synchronise almost instantly.

---

## Primary Goal

Allow two people to remember everything required to care for a home without relying on memory or deadlines.

---

## Success Criteria

The application succeeds if users never wonder:

> "I know there was something I needed to do..."

Instead they simply open Tending to Troy.

---

## Onboarding & Invitation

Version 1 supports exactly one household with exactly two users.

**Setup flow:**
1. The first user registers with email and password. This creates the household.
2. The application generates a single-use invitation link.
3. The first user shares this link with the second user (via any method they choose — message, email, etc.).
4. The second user follows the link, registers with email and password, and is joined to the household.
5. Once both users have joined, the invitation link expires.

No further registrations are permitted. The household is closed.

If the second user has not yet joined, the first user can generate a new invitation link to replace the previous one.

Future versions may support magic links in place of passwords.

---

## Home Screen

The home screen is intentionally minimal. It contains four collapsible sections:

- Priority 1
- Priority 2
- Priority 3
- Priority 4

Each section displays a list of task cards. Cards should have generous spacing. Cards should resemble premium index cards.

Each card displays:
- Title
- Indoor / Outdoor badge
- Owner
- Shopping indicator
- Pin icon (if pinned)

Pinned tasks always appear first within their priority group. Each section remembers whether it was last open or collapsed.

---

## Task Ordering

Within each priority:

```
Pinned tasks
↓
Remaining tasks (manual drag-and-drop order)
```

Users should be able to rearrange tasks naturally.

---

## Task Detail Screen

Selecting a task opens a dedicated page.

Every task contains:

**Title**

**Priority** — 1, 2, 3, or 4

**Owner**
- Tim
- Wife
- Anyone

**Location**
- Indoor
- Outdoor

**Status**
- Active
- Completed
- Archived

**Description** — Unlimited formatted text.

**Checklist** — Unlimited checklist items.

**Notes** — Unlimited formatted notes.

**Shopping List** — Unlimited items.

**Links** — Unlimited links.

**History**
- Created
- Last edited
- Completed
- Archived

---

## Rich Text

Description and Notes support:
- Headings
- Bold
- Italic
- Bullet lists
- Numbered lists
- Simple hyperlinks

No advanced document editing is required.

---

## Checklist

Checklist items support:
- Complete / Incomplete toggle
- Drag to reorder
- Unlimited length

---

## Shopping List

Each task may include shopping items. Example:
- Decking Oil
- Brushes
- Sealant
- Weed Killer

Shopping items can be ticked independently. Version 1 stores items and quantities only. Price comparison will be introduced later.

---

## Links

Users can save:
- Instruction manuals
- YouTube videos
- Product pages
- Helpful websites

Opening a link uses the device browser.

---

## Weather

Only Outdoor tasks display weather information. Weather should be intentionally simple.

**Source:** UK Met Office DataHub API.

**Logic:** Weather is assessed for the next 3 hours from the current time. If any hourly slot in that window carries a precipitation probability of 40% or greater, or a weather type code indicating rain, sleet, snow, or heavy showers, the warning state is shown.

**States:**

- *Warning:* "Rain may make this task difficult."
- *Suitable:* "Weather suitable."

No weather radar. No extended forecasts. No AI interpretation. No weather graphs.

The weather feature exists only to answer: *"Is today sensible for this job?"*

Weather data is cached for 30 minutes per location. If the Met Office API is unavailable, the banner is hidden rather than showing an error.

---

## Search

Users can search by task title.

Version 1 does not require note or description searching.

Archived tasks are included in search results and clearly labelled as archived.

---

## Task Lifecycle

```
Create → Edit → Move priority → Pin/Unpin → Complete → Archive → Restore (optional)
```

Deletion requires confirmation. Archived tasks remain searchable and recoverable.

---

## Pinning

Pinned tasks remain fixed at the top of their priority section. Pinning uses a subtle brass skeuomorphic drawing pin. The animation resembles placing a drawing pin into paper.

---

## Simultaneous Editing

When both users edit the same task at the same time, the last save wins. This is an acceptable trade-off given the two-person household context. However, every save must be logged with a timestamp and user ID so that the history trail reflects what actually happened. Users are not shown a conflict warning, but the history section will reflect recent changes, allowing either user to spot and correct an accidental overwrite.

---

## Notifications

Version 1 deliberately has no notifications. The application should never pressure users.

---

## Authentication

Simple email and password. Only invited users can join the shared home. Future versions may support magic links.

---

## Synchronisation

Changes should appear across both devices within seconds. No manual refresh. No save button. Everything auto-saves.

---

## Offline Behaviour

If the internet is unavailable:
- The user can still read all previously loaded tasks.
- Edits made offline are clearly flagged with a subtle "Saving when connected..." indicator.
- Edits queue locally and sync automatically when the connection returns.
- If an offline edit cannot be synced after reconnection, a plain-English message is shown and the user is prompted to retry.

The application must never silently discard an edit. This is a hard requirement.

---

## Platform

**Primary target:** Progressive Web App (PWA)

Requirements:
- Works on iPhone
- Works on Android
- Installable from browser
- Works like a native app
- Responsive, fast, reliable
- Automatic updates

Future versions may become native apps.

---

## Performance

Target load time: under two seconds. Navigation should feel immediate. Animations should remain subtle.

---

## Design Principles

The interface should feel: warm, elegant, quiet, timeless, intentional.

Avoid: corporate styling, bright colours, overly flat design, glassmorphism, neon accents, heavy gradients.

---

## Accessibility

- Large touch targets (minimum 44px).
- Readable typography.
- High contrast (WCAG AA minimum).
- Support dynamic text sizing where practical.
- Keyboard accessible on desktop.
- Landscape compatible.

---

## Future Features

Intentionally excluded from Version 1 but should influence the architecture:

- AI-assisted shopping recommendations.
- UK retailer price comparison.
- Monzo integration.
- Budget checking against upcoming bills.
- House inventory.
- Equipment register.
- Manual library.
- Photo attachments.
- Recurring maintenance.
- Apple orchard management.
- Log cabin maintenance planner.
- Multiple properties.
- Export to PDF.
- CSV backup.
- Weather forecasts.
- Widgets.

---

## Product Identity

**Application Name:** Tending to Troy
**Tagline:** Care for our home.

The application should feel like opening a beautifully crafted household journal that grows alongside the home for many years. Every interaction should reinforce calm, ownership and care rather than productivity.

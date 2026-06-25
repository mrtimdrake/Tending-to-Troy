# Tending to Troy
## Technical Architecture & Engineering Specification
### Version 1.1

---

## Purpose

This document describes the preferred technical architecture for Tending to Troy. The objective is to create a fast, maintainable and elegant application that can be comfortably maintained by AI-assisted development over many years.

The project should favour simplicity over unnecessary complexity. Avoid overengineering.

---

## Core Principles

The application should be: fast, simple, reliable, maintainable, secure, responsive, offline-friendly where practical, cross-platform.

---

## Preferred Platform

**Primary platform:** Progressive Web Application (PWA)

Reasons: single codebase, works on iPhone and Android, desktop compatible, easy deployment, instant updates, no App Store approval required.

Future native applications can be produced later if desired.

---

## Recommended Technology Stack

| Layer | Choice |
|---|---|
| Frontend framework | Next.js |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Backend / Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Hosting | Vercel |
| Weather | UK Met Office DataHub API |

**Future integrations:** Monzo API, Retailer APIs, AI services.

---

## Application Architecture

```
Client
  ↓
Authentication (Supabase Auth)
  ↓
Supabase API (RLS-enforced)
  ↓
PostgreSQL Database
  ↓
Real-time Synchronisation (Supabase Realtime)
  ↓
Both Users
```

---

## Authentication & Invitation

Email and password. Invitation-only household.

Version 1 supports exactly one household and exactly two users.

**Invitation flow:**
1. First user registers → household row is created → invitation token is generated and stored against the household.
2. First user shares the invitation link (contains the token).
3. Second user follows the link → registers → is joined to the household → invitation token is marked used.
4. Once used, no further registrations are accepted for that household.
5. If the second user has not joined, the first user can regenerate the token (previous token is invalidated).

The invitation token should be a securely generated random string stored on the `household` table with a `used` boolean. Token validation happens server-side in a Next.js API route before the registration is accepted.

Future architecture should allow multiple households without requiring database redesign. The `household_id` foreign key on every table already provides this isolation.

---

## Database Design

### households
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| invitation_token | text | Single-use |
| invitation_used | boolean | Default false |
| created_at | timestamptz | |

### users
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | Matches Supabase Auth uid |
| household_id | uuid FK → households | |
| name | text | |
| email | text | |
| created_at | timestamptz | |

### tasks
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| household_id | uuid FK → households | |
| title | text | |
| priority | int | 1–4 |
| manual_order | int | Within priority group |
| owner | text | 'tim' / 'wife' / 'anyone' |
| location | text | 'indoor' / 'outdoor' |
| status | text | 'active' / 'completed' / 'archived' / 'deleted' |
| description | text | Markdown |
| notes | text | Markdown |
| is_pinned | boolean | Default false |
| created_by | uuid FK → users | |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| completed_at | timestamptz | Nullable |
| archived_at | timestamptz | Nullable |

### checklist_items
| Column | Type |
|---|---|
| id | uuid PK |
| task_id | uuid FK → tasks |
| text | text |
| completed | boolean |
| manual_order | int |

### shopping_items
| Column | Type |
|---|---|
| id | uuid PK |
| task_id | uuid FK → tasks |
| name | text |
| quantity | text | Nullable |
| completed | boolean |
| manual_order | int |

### links
| Column | Type |
|---|---|
| id | uuid PK |
| task_id | uuid FK → tasks |
| title | text |
| url | text |
| manual_order | int |

### task_history
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| task_id | uuid FK → tasks | |
| changed_by | uuid FK → users | |
| changed_at | timestamptz | |
| change_summary | text | Human-readable description of what changed |

Every save — including auto-saves — writes a history entry. This provides recovery context when a simultaneous edit causes an unintended overwrite.

---

## Row Level Security (RLS)

All tables must have RLS enabled. Users may only read and write rows belonging to their own household.

**Policy pattern for all tables:**

```sql
-- Read
CREATE POLICY "household members can read"
  ON tasks FOR SELECT
  USING (
    household_id = (
      SELECT household_id FROM users WHERE id = auth.uid()
    )
  );

-- Write
CREATE POLICY "household members can write"
  ON tasks FOR ALL
  USING (
    household_id = (
      SELECT household_id FROM users WHERE id = auth.uid()
    )
  );
```

Apply equivalent policies to: `checklist_items`, `shopping_items`, `links`, `task_history`.

The `households` table should only be readable/writable via server-side API routes — never directly from the client.

RLS policies must be defined and tested before any user-facing feature is built. A misconfigured policy could expose one household's data to another.

---

## Synchronisation

All editing updates in real time via Supabase Realtime. No refresh button. No save button. Auto-save after edits.

**Conflict resolution:** Last write wins. Every write also appends a `task_history` entry so that accidental overwrites are visible and recoverable.

---

## Offline Behaviour

When the network is unavailable:

1. Previously loaded tasks remain readable from the in-memory React state / local cache.
2. Any edit is queued in a local pending-edits store (e.g. `localStorage` or IndexedDB).
3. A subtle persistent indicator is shown: *"Saving when connected..."*
4. On reconnection, queued edits are flushed in order of creation.
5. If a flush fails after reconnection, a plain-English message is shown and the user can retry.

The application must never silently discard an edit.

**Note:** Full offline-first sync (e.g. conflict-aware CRDT merging) is not required for Version 1. The queue-and-flush approach is acceptable given the two-person, single-household context and the expectation that both users are usually online.

---

## Priority & Ordering Logic

Priority values: 1, 2, 3, 4.

Within each priority:
```
Pinned tasks (by manual_order)
↓
Non-pinned tasks (by manual_order)
```

No automatic sorting. The user controls ordering. `manual_order` is an integer; reordering updates only the affected rows.

---

## Status Values

- `active`
- `completed`
- `archived`
- `deleted`

Soft deletion only. Records are never removed from the database. Status transitions are: active → completed, active → archived, any → deleted (with confirmation). Archived and deleted tasks can be restored to active.

---

## Weather Integration

Only Outdoor tasks request weather data.

**Source:** UK Met Office DataHub API (requires registration and API key stored as an environment variable — never committed to the repository).

**Logic:** Fetch the hourly forecast for the household's location. Assess the next 3 hours. If any hour has a precipitation probability ≥ 40%, or a weather type code in the rain/sleet/snow/heavy shower range, return the warning state.

**States returned to the client:**
- `suitable`
- `warning`
- `unavailable` (API unreachable — banner hidden)

Weather is fetched server-side (Next.js API route) so the API key is never exposed to the client. Results are cached for 30 minutes.

---

## Rich Text

Markdown is the storage format for description and notes fields.

Supported elements:
- Headings (H1–H3)
- Bold, Italic
- Bullet lists, Numbered lists
- Hyperlinks

No complex formatting. Render with a lightweight Markdown renderer (e.g. `react-markdown`).

---

## Typography & Font Loading

Geist (headings) and Source Serif 4 (body) must be loaded with care to meet the <2 second load target.

Requirements:
- Use `next/font` for both typefaces — this handles subsetting and preloading automatically.
- Set `font-display: swap` to prevent invisible text during load.
- Subset fonts to Latin only.
- Do not load font weights not used in the design system.

This must be configured in Phase 1 alongside the design token setup, not deferred to the polish phase.

---

## Performance Targets

| Scenario | Target |
|---|---|
| Application load | < 2 seconds |
| Task open | < 300ms |
| Search | Instant (client-side filter) |
| Dragging | 60fps |
| Weather response | < 500ms |

---

## Security

- HTTPS everywhere.
- Passwords handled entirely by Supabase Auth — never stored or transmitted directly.
- API keys (Met Office, future integrations) stored as Vercel environment variables only.
- RLS enforced on all database tables.
- Invitation token validated server-side.
- No sensitive data logged.

---

## Error Handling

Graceful. No technical error messages exposed to users.

Example user-facing messages:
- *"Unable to save your changes."*
- *"Retrying..."*
- *"Task couldn't be archived."*
- *"Saving when connected..."* (offline)

Retry automatically where possible.

---

## Deployment

```
GitHub repository
  ↓
Vercel (automatic deploy on push to main)
  ↓
Production
```

Every push to `main` deploys automatically.

---

## Code Quality

- Strict TypeScript throughout.
- Reusable components with single responsibilities.
- Small functions with meaningful names.
- Avoid unnecessary abstraction.
- Comment only where the reason is non-obvious.
- No dead code. No duplicated components.

---

## Folder Structure

```
/app
/components
/features
/hooks
/lib
/styles
/types
/public
```

---

## Key Components

- TaskCard
- TaskDetail
- PrioritySection
- ChecklistEditor
- ShoppingList
- LinkList
- WeatherBanner
- SearchBar
- Navigation
- ProfileMenu
- PinButton (brass drawing pin — prototype early, see Implementation Plan)
- OfflineBanner
- Button, Input, Modal (primitives)

Each component has one responsibility.

---

## State Management

Keep simple. Prefer React state. Use Supabase client for server state. Avoid introducing global state libraries unless genuinely required.

---

## Testing

**Unit tests:**
- Priority ordering logic
- Pinning logic
- Manual order recalculation on drag
- Search filtering
- Weather state derivation (given forecast input → expected state)
- Offline queue flush logic
- Invitation token validation

**Integration tests:**
- Create task
- Edit task (single user)
- Simultaneous edit (verify history entry written)
- Delete task (confirm required)
- Archive / restore
- Synchronisation across two sessions
- Invitation flow end-to-end

---

## Logging

Basic server-side error logging (Vercel logs). No client-side analytics. No advertising. No user tracking. Privacy first.

---

## Future Integrations

The architecture must accommodate without redesign:
- Monzo (budget checking)
- AI shopping assistant
- Retail price comparison
- Photo storage (Supabase Storage)
- Equipment register
- Recurring maintenance
- Multiple households
- Calendar export
- Widgets

---

## Engineering Philosophy

When choosing between a clever solution and a simple solution, prefer the simple solution.

The application is expected to grow slowly over many years. Readability and maintainability are more important than clever architecture. The codebase should remain understandable by both human developers and AI coding assistants.

Every engineering decision should support long-term stability rather than short-term optimisation.

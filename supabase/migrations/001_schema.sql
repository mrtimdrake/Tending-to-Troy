-- ============================================================
-- Tending to Troy — Initial Schema
-- Migration 001
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";


-- ============================================================
-- households
-- ============================================================
create table households (
  id               uuid primary key default gen_random_uuid(),
  name             text not null default 'Our Home',
  invitation_token text unique,
  invitation_used  boolean not null default false,
  created_at       timestamptz not null default now()
);


-- ============================================================
-- users
-- Mirrors auth.users — one row per authenticated user.
-- id must match the Supabase Auth uid.
-- ============================================================
create table users (
  id           uuid primary key references auth.users(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  name         text not null,
  email        text not null,
  created_at   timestamptz not null default now()
);

create index users_household_id_idx on users(household_id);


-- ============================================================
-- tasks
-- ============================================================
create table tasks (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  title        text not null,
  priority     smallint not null check (priority between 1 and 4),
  manual_order integer not null default 0,
  owner        text not null default 'anyone' check (owner in ('tim', 'wife', 'anyone')),
  location     text not null default 'indoor' check (location in ('indoor', 'outdoor')),
  status       text not null default 'active' check (status in ('active', 'completed', 'archived', 'deleted')),
  description  text,
  notes        text,
  is_pinned    boolean not null default false,
  created_by   uuid not null references users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  completed_at timestamptz,
  archived_at  timestamptz
);

create index tasks_household_id_idx on tasks(household_id);
create index tasks_status_idx on tasks(status);
create index tasks_priority_idx on tasks(priority);


-- ============================================================
-- checklist_items
-- ============================================================
create table checklist_items (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references tasks(id) on delete cascade,
  text         text not null,
  completed    boolean not null default false,
  manual_order integer not null default 0
);

create index checklist_items_task_id_idx on checklist_items(task_id);


-- ============================================================
-- shopping_items
-- ============================================================
create table shopping_items (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references tasks(id) on delete cascade,
  name         text not null,
  quantity     text,
  completed    boolean not null default false,
  manual_order integer not null default 0
);

create index shopping_items_task_id_idx on shopping_items(task_id);


-- ============================================================
-- links
-- ============================================================
create table links (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references tasks(id) on delete cascade,
  title        text,
  url          text not null,
  manual_order integer not null default 0
);

create index links_task_id_idx on links(task_id);


-- ============================================================
-- task_history
-- Every save appends a row here — used to surface overwrites
-- and provide a readable audit trail on the task detail screen.
-- ============================================================
create table task_history (
  id             uuid primary key default gen_random_uuid(),
  task_id        uuid not null references tasks(id) on delete cascade,
  changed_by     uuid not null references users(id),
  changed_at     timestamptz not null default now(),
  change_summary text not null
);

create index task_history_task_id_idx on task_history(task_id);


-- ============================================================
-- updated_at trigger — keeps tasks.updated_at current
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row
  execute function update_updated_at();

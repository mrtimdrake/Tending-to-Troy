-- ============================================================
-- Tending to Troy — Row Level Security Policies
-- Migration 002
--
-- Pattern: every table is locked to the authenticated user's
-- household. The helper function resolves the calling user's
-- household_id from the public.users table once per query.
--
-- The households table is intentionally NOT accessible from
-- the client — all household operations go through server
-- actions using the service-role key.
-- ============================================================


-- ============================================================
-- Helper function
-- Returns the household_id for the currently authenticated user.
-- Marked SECURITY DEFINER so it can read public.users regardless
-- of the calling context.
-- ============================================================
create or replace function get_my_household_id()
returns uuid
language sql
stable
security definer
as $$
  select household_id from public.users where id = auth.uid()
$$;


-- ============================================================
-- households — no direct client access
-- All household reads/writes go through server actions.
-- ============================================================
alter table households enable row level security;

-- No policies created — RLS blocks all client access by default.
-- Server actions use the service-role key which bypasses RLS.


-- ============================================================
-- users
-- ============================================================
alter table users enable row level security;

create policy "users: read own household"
  on users for select
  using (household_id = get_my_household_id());

-- Users cannot insert/update/delete their own user row from
-- the client. Registration is handled server-side via the
-- service-role admin client.


-- ============================================================
-- tasks
-- ============================================================
alter table tasks enable row level security;

create policy "tasks: read own household"
  on tasks for select
  using (household_id = get_my_household_id());

create policy "tasks: insert own household"
  on tasks for insert
  with check (household_id = get_my_household_id());

create policy "tasks: update own household"
  on tasks for update
  using (household_id = get_my_household_id())
  with check (household_id = get_my_household_id());

-- Soft delete only — no hard deletes from the client.
-- Status is updated to 'deleted' via the update policy above.


-- ============================================================
-- checklist_items
-- ============================================================
alter table checklist_items enable row level security;

create policy "checklist_items: read own household"
  on checklist_items for select
  using (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );

create policy "checklist_items: insert own household"
  on checklist_items for insert
  with check (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );

create policy "checklist_items: update own household"
  on checklist_items for update
  using (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );

create policy "checklist_items: delete own household"
  on checklist_items for delete
  using (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );


-- ============================================================
-- shopping_items
-- ============================================================
alter table shopping_items enable row level security;

create policy "shopping_items: read own household"
  on shopping_items for select
  using (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );

create policy "shopping_items: insert own household"
  on shopping_items for insert
  with check (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );

create policy "shopping_items: update own household"
  on shopping_items for update
  using (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );

create policy "shopping_items: delete own household"
  on shopping_items for delete
  using (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );


-- ============================================================
-- links
-- ============================================================
alter table links enable row level security;

create policy "links: read own household"
  on links for select
  using (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );

create policy "links: insert own household"
  on links for insert
  with check (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );

create policy "links: update own household"
  on links for update
  using (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );

create policy "links: delete own household"
  on links for delete
  using (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );


-- ============================================================
-- task_history
-- ============================================================
alter table task_history enable row level security;

create policy "task_history: read own household"
  on task_history for select
  using (
    task_id in (
      select id from tasks where household_id = get_my_household_id()
    )
  );

-- History rows are inserted by server actions using the admin
-- client — no direct client insert policy needed.

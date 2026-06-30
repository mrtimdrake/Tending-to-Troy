-- ============================================================
-- Tending to Troy — Realtime
-- Migration 003
--
-- Adds the tasks table to the supabase_realtime publication so that
-- inserts/updates/deletes are broadcast to subscribed clients. RLS still
-- applies to realtime payloads, so each user only receives changes for
-- their own household.
--
-- Related sub-tables (checklist_items, shopping_items, links) will be
-- added to this publication in Milestone 4 when the detail screen needs
-- live sub-collections.
-- ============================================================

alter publication supabase_realtime add table tasks;

-- =============================================================
-- ScholarMatch Schema — Phase 3
-- Tracks who added custom scholarships so we can enforce a
-- per-user quota (protecting the shared, free-tier database from
-- abuse) and enable per-user scoping later.
--
-- Run this in Supabase SQL Editor.
-- =============================================================

alter table public.scholarships
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create index if not exists idx_scholarships_created_by on public.scholarships(created_by);

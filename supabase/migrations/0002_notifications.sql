-- =============================================================
-- ScholarMatch Schema — Phase 2
-- Adds notification preferences for email alerts (feature-ready;
-- sending is wired when an email provider is configured).
-- Run this in Supabase SQL Editor.
-- =============================================================

alter table public.user_profiles
  add column if not exists notifications jsonb default '{"newMatches": false, "deadlineReminders": false}';

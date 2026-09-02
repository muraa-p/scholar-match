-- =============================================================
-- ScholarMatch Schema — Phase 1
-- Run this in Supabase SQL Editor
-- =============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- =============================================================
-- SCHOLARSHIPS (public read, service-role write)
-- =============================================================
create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  title text not null,
  provider text not null,
  university text,
  host_country text not null,
  degree_levels text[] not null default '{}',
  fields_of_study text[] not null default '{}',
  funding_type text not null default 'Fully Funded',
  financial_coverage jsonb default '{}',
  deadline text,
  deadline_status text default 'open',
  summary text,
  key_requirements text[] default '{}',
  eligibility_criteria jsonb default '{}',
  rejection_pitfalls text[] default '{}',
  insider_tips text[] default '{}',
  official_application_url text,
  contacts jsonb default '{}',
  default_checklist jsonb default '[]',
  source_url text,
  source_name text,
  last_verified_at timestamptz,
  is_custom boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.scholarships enable row level security;
create policy "scholarships_public_read" on public.scholarships
  for select using (true);

-- =============================================================
-- USER PROFILES (per auth user)
-- =============================================================
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Scholar Applicant',
  nationality text default 'International',
  current_degree text default 'Bachelor / Undergraduate',
  target_degree text default 'Master / Postgraduate',
  gpa numeric(3,2) default 3.6,
  field_of_study text default 'STEM & Computer Science',
  target_countries text[] default '{}',
  work_experience_years integer default 0,
  english_proficiency text default 'ielts_toefl_ready',
  ielts_score text,
  funding_need text default 'full_only',
  target_year text default '2026/2027',
  previous_rejections_description text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_profiles enable row level security;
create policy "user_profiles_read_own" on public.user_profiles
  for select using (auth.uid() = id);
create policy "user_profiles_insert_own" on public.user_profiles
  for insert with check (auth.uid() = id);
create policy "user_profiles_update_own" on public.user_profiles
  for update using (auth.uid() = id);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================
-- SAVED SCHOLARSHIPS
-- =============================================================
create table if not exists public.saved_scholarships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  scholarship_id uuid references public.scholarships(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (user_id, scholarship_id)
);

alter table public.saved_scholarships enable row level security;
create policy "saved_read_own" on public.saved_scholarships
  for select using (auth.uid() = user_id);
create policy "saved_insert_own" on public.saved_scholarships
  for insert with check (auth.uid() = user_id);
create policy "saved_delete_own" on public.saved_scholarships
  for delete using (auth.uid() = user_id);

-- =============================================================
-- TRACKED APPLICATIONS
-- =============================================================
create table if not exists public.tracked_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  scholarship_id uuid references public.scholarships(id) on delete cascade not null,
  custom_title text,
  status text default 'preparing',
  applied_date date,
  deadline text,
  portal_url text,
  personal_notes text,
  draft_motivation_letter text,
  ai_analysis_result jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, scholarship_id)
);

alter table public.tracked_applications enable row level security;
create policy "tracked_read_own" on public.tracked_applications
  for select using (auth.uid() = user_id);
create policy "tracked_insert_own" on public.tracked_applications
  for insert with check (auth.uid() = user_id);
create policy "tracked_update_own" on public.tracked_applications
  for update using (auth.uid() = user_id);
create policy "tracked_delete_own" on public.tracked_applications
  for delete using (auth.uid() = user_id);

-- =============================================================
-- CHECKLISTS
-- =============================================================
create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.tracked_applications(id) on delete cascade not null,
  title text not null,
  category text default 'document',
  completed boolean default false,
  due_date date,
  notes text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.checklists enable row level security;
create policy "checklists_read_own" on public.checklists
  for select using (
    application_id in (
      select id from public.tracked_applications where user_id = auth.uid()
    )
  );
create policy "checklists_insert_own" on public.checklists
  for insert with check (
    application_id in (
      select id from public.tracked_applications where user_id = auth.uid()
    )
  );
create policy "checklists_update_own" on public.checklists
  for update using (
    application_id in (
      select id from public.tracked_applications where user_id = auth.uid()
    )
  );
create policy "checklists_delete_own" on public.checklists
  for delete using (
    application_id in (
      select id from public.tracked_applications where user_id = auth.uid()
    )
  );

-- =============================================================
-- COMMUNICATION LOG
-- =============================================================
create table if not exists public.communication_log (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.tracked_applications(id) on delete cascade not null,
  date date not null default current_date,
  recipient text,
  topic text,
  notes text,
  replied boolean default false,
  created_at timestamptz default now()
);

alter table public.communication_log enable row level security;
create policy "comms_read_own" on public.communication_log
  for select using (
    application_id in (
      select id from public.tracked_applications where user_id = auth.uid()
    )
  );
create policy "comms_insert_own" on public.communication_log
  for insert with check (
    application_id in (
      select id from public.tracked_applications where user_id = auth.uid()
    )
  );
create policy "comms_update_own" on public.communication_log
  for update using (
    application_id in (
      select id from public.tracked_applications where user_id = auth.uid()
    )
  );
create policy "comms_delete_own" on public.communication_log
  for delete using (
    application_id in (
      select id from public.tracked_applications where user_id = auth.uid()
    )
  );

-- =============================================================
-- AI SUMMARIES CACHE
-- =============================================================
create table if not exists public.ai_summaries (
  id uuid primary key default gen_random_uuid(),
  scholarship_id uuid references public.scholarships(id) on delete cascade unique,
  summary_data jsonb not null,
  model_used text,
  created_at timestamptz default now(),
  expires_at timestamptz
);

alter table public.ai_summaries enable row level security;
create policy "ai_summaries_read" on public.ai_summaries
  for select using (true);

-- =============================================================
-- DISCOVERY LOG
-- =============================================================
create table if not exists public.discovery_log (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  source_name text,
  status text default 'pending',
  scholarships_found integer default 0,
  error_message text,
  created_at timestamptz default now()
);

alter table public.discovery_log enable row level security;
create policy "discovery_log_read" on public.discovery_log
  for select using (true);

-- =============================================================
-- INDEXES
-- =============================================================
create index if not exists idx_scholarships_country on public.scholarships(host_country);
create index if not exists idx_scholarships_funding on public.scholarships(funding_type);
create index if not exists idx_scholarships_deadline on public.scholarships(deadline);
create index if not exists idx_scholarships_active on public.scholarships(is_active);
create index if not exists idx_tracked_user on public.tracked_applications(user_id);
create index if not exists idx_tracked_scholarship on public.tracked_applications(scholarship_id);
create index if not exists idx_saved_user on public.saved_scholarships(user_id);

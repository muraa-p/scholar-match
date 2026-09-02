# ScholarMatch — Production Build Plan

## Context

ScholarMatch is a React+Vite+TypeScript scholarship discovery portal. Currently it's entirely client-side with hardcoded data in localStorage. The goal is to make it production-ready with:

1. **Automatic scholarship discovery** — background job that scrapes the web, extracts structured data via AI, and populates the database
2. **Supabase** — database, auth, real-time sync
3. **API-first design** — REST endpoints for Flutter mobile app later
4. **Gemini AI** — for extraction, summarization, SOP drafting, essay review
5. **Vercel** — hosting

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Vercel (Hosting)                │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  React SPA   │  │  Next.js API Routes /    │ │
│  │  (Frontend)  │  │  Express Serverless       │ │
│  └──────┬───────┘  └──────────┬───────────────┘ │
│         │                     │                  │
│         └─────────┬───────────┘                  │
│                   │                              │
│         ┌─────────▼──────────┐                   │
│         │     Supabase       │                   │
│         │  ┌──────────────┐  │                   │
│         │  │  PostgreSQL  │  │                   │
│         │  │  + Auth      │  │                   │
│         │  │  + Storage   │  │                   │
│         │  └──────────────┘  │                   │
│         └────────────────────┘                   │
│                                                  │
│         ┌────────────────────┐                   │
│         │  Discovery Worker  │  (Vercel Cron /   │
│         │  (Background Job)  │   Inngest / QStash)│
│         │  - Web Scraper     │                   │
│         │  - Gemini Extract  │                   │
│         │  - DB Write        │                   │
│         └────────────────────┘                   │
└─────────────────────────────────────────────────┘

Flutter App → REST API → Supabase / Serverless Functions
```

---

## Phase 1: Supabase Setup + Schema Design

### 1.1 Create Supabase Project
- User creates project at supabase.com
- Get `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### 1.2 Database Schema (SQL migrations)

```sql
-- Scholarships table (discovered + seed data)
CREATE TABLE scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE, -- for deduplication
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  university TEXT,
  host_country TEXT NOT NULL,
  degree_levels TEXT[] NOT NULL,
  fields_of_study TEXT[] NOT NULL,
  funding_type TEXT NOT NULL,
  financial_coverage JSONB,
  deadline TEXT,
  deadline_status TEXT DEFAULT 'open',
  summary TEXT,
  key_requirements TEXT[],
  eligibility_criteria JSONB,
  rejection_pitfalls TEXT[],
  insider_tips TEXT[],
  official_application_url TEXT,
  contacts JSONB,
  default_checklist JSONB,
  source_url TEXT, -- where we found it
  source_name TEXT, -- e.g. "scholarships.com"
  last_verified_at TIMESTAMPTZ,
  is_custom BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Scholar Applicant',
  nationality TEXT,
  current_degree TEXT,
  target_degree TEXT,
  gpa DECIMAL(3,2),
  field_of_study TEXT,
  target_countries TEXT[],
  work_experience_years INTEGER DEFAULT 0,
  english_proficiency TEXT,
  ielts_score TEXT,
  funding_need TEXT DEFAULT 'full_only',
  target_year TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Saved/bookmarked scholarships
CREATE TABLE saved_scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, scholarship_id)
);

-- Tracked applications
CREATE TABLE tracked_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'preparing',
  applied_date DATE,
  deadline TEXT,
  portal_url TEXT,
  personal_notes TEXT,
  draft_motivation_letter TEXT,
  ai_analysis_result JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, scholarship_id)
);

-- Checklists (per application)
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES tracked_applications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'document',
  completed BOOLEAN DEFAULT false,
  due_date DATE,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Communication log
CREATE TABLE communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES tracked_applications(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  recipient TEXT,
  topic TEXT,
  notes TEXT,
  replied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI summaries cache
CREATE TABLE ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE,
  summary_data JSONB NOT NULL,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(scholarship_id)
);

-- Discovery log (track what we've scraped)
CREATE TABLE discovery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  source_name TEXT,
  status TEXT DEFAULT 'pending', -- pending, processed, failed, duplicate
  scholarships_found INTEGER DEFAULT 0,
  error_message TEXT,
  run_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only read/write their own data
CREATE POLICY "Users read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users read own saved" ON saved_scholarships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saved" ON saved_scholarships FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users read own apps" ON tracked_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own apps" ON tracked_applications FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users read own checklists" ON checklists FOR SELECT
  USING (application_id IN (SELECT id FROM tracked_applications WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own checklists" ON checklists FOR ALL
  USING (application_id IN (SELECT id FROM tracked_applications WHERE user_id = auth.uid()));

CREATE POLICY "Users read own comms" ON communication_log FOR SELECT
  USING (application_id IN (SELECT id FROM tracked_applications WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own comms" ON communication_log FOR ALL
  USING (application_id IN (SELECT id FROM tracked_applications WHERE user_id = auth.uid()));

-- Scholarships are public read, service-role write
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read scholarships" ON scholarships FOR SELECT USING (true);

-- AI summaries: public read (cached), service-role write
CREATE POLICY "Anyone can read summaries" ON ai_summaries FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX idx_scholarships_country ON scholarships(host_country);
CREATE INDEX idx_scholarships_funding ON scholarships(funding_type);
CREATE INDEX idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX idx_scholarships_active ON scholarships(is_active);
CREATE INDEX idx_tracked_user ON tracked_applications(user_id);
CREATE INDEX idx_saved_user ON saved_scholarships(user_id);
```

### 1.3 Seed Existing Scholarships
- Migrate the 10+ hardcoded scholarships from `scholarshipsData.ts` into Supabase
- Delete `scholarshipsData.ts` and `storage.ts` (dead code)

---

## Phase 2: Auth + API Layer

### 2.1 Supabase Auth
- Email/password auth (primary)
- Google OAuth (optional, free tier)
- Auto-create `user_profiles` row on signup via database trigger

### 2.2 API Routes (Vercel Serverless or Express on Vercel)
All routes prefixed with `/api/v1/`:

```
POST   /api/v1/auth/signup          — Register
POST   /api/v1/auth/login           — Login
POST   /api/v1/auth/logout          — Logout
GET    /api/v1/auth/me              — Current user + profile

GET    /api/v1/scholarships          — List (with filters, search, pagination)
GET    /api/v1/scholarships/:id      — Detail
GET    /api/v1/scholarships/match    — Match scores for current user

GET    /api/v1/profile               — Get profile
PUT    /api/v1/profile               — Update profile

GET    /api/v1/saved                 — List saved scholarships
POST   /api/v1/saved/:scholarshipId  — Toggle save
DELETE /api/v1/saved/:scholarshipId  — Unsave

GET    /api/v1/applications          — List tracked apps
POST   /api/v1/applications          — Track a scholarship
PUT    /api/v1/applications/:id      — Update status/notes
DELETE /api/v1/applications/:id      — Remove

GET    /api/v1/applications/:id/checklist   — Get checklist
POST   /api/v1/applications/:id/checklist   — Add item
PUT    /api/v1/applications/:id/checklist/:itemId — Toggle/edit
DELETE /api/v1/applications/:id/checklist/:itemId — Delete

POST   /api/v1/applications/:id/commlog     — Add communication
PUT    /api/v1/applications/:id/commlog/:logId — Update

POST   /api/v1/ai/summarize         — Summarize scholarship (existing, cleaned up)
POST   /api/v1/ai/diagnose-fit      — Rejection diagnostic (NEW)
POST   /api/v1/ai/draft-sop         — SOP/motivation drafter (NEW)
POST   /api/v1/ai/review-essay      — Essay reviewer (NEW)

GET    /api/v1/backup/export        — Export all user data
POST   /api/v1/backup/import        — Import data
```

### 2.3 Frontend Migration
- Replace all `localStorage` calls in `db.ts` with API calls
- Add Supabase client (`@supabase/supabase-js`) to frontend
- Add auth context/provider (login, signup, session management)
- Remove `storage.ts` (dead code)
- Clean up dead props in components
- Merge duplicate tracker components

---

## Phase 3: Scholarship Discovery Engine

### 3.1 Architecture
A background job that:
1. Scrapes scholarship aggregator sites
2. Sends raw HTML/text to Gemini for structured extraction
3. Deduplicates against existing records
4. Writes new scholarships to Supabase
5. Logs discovery runs

### 3.2 Source Strategy (Free Tier)
**Tier 1 — High-quality aggregators (scrape these):**
- `scholarships.com` / `scholarshipproviders.com`
- `internationalscholarships.com`
- `fastweb.com` (US-focused)
- `scholarshipportal.com`
- Government scholarship pages (Chevening, Fulbright, DAAD, MEXT, etc.)

**Tier 2 — AI-discovered (query Gemini with broad prompts):**
- "List all fully funded Master's scholarships for international students in 2026/2027"
- Country-specific queries
- Field-specific queries

**Tier 3 — RSS/structured feeds:**
- Some scholarship sites offer RSS feeds

### 3.3 Scheduler Options (Free Tier)
| Option | Free Tier | Notes |
|--------|-----------|-------|
| **Vercel Cron Jobs** | 1 job/day on Hobby | Simple but limited |
| **Inngest** | 1M events/month | Best option — reliable, free, handles retries |
| **QStash (Upstash)** | 1M requests/month | Good alternative |
| **GitHub Actions cron** | 2000 min/month | Hacky but works |

**Recommendation: Inngest** — free, purpose-built for this, handles scheduling + retries + monitoring.

### 3.4 Extraction Pipeline (per source)

```
1. Fetch raw HTML from scholarship URL
2. Clean HTML → extract text content
3. Send to Gemini with structured extraction prompt:
   "Extract scholarship info from this text. Return JSON with:
    title, provider, university, hostCountry, degreeLevels,
    fieldsOfStudy, fundingType, financialCoverage, deadline,
    keyRequirements, eligibilityCriteria, contacts, etc."
4. Validate response against Scholarship type schema
5. Deduplicate by title+provider+country
6. Write to Supabase scholarships table
7. Log in discovery_log
```

### 3.5 Gemini Extraction Prompt Template
```typescript
const EXTRACTION_PROMPT = `
You are a scholarship data extraction engine. Given raw text from a scholarship
webpage, extract ALL structured information and return valid JSON matching
this schema: ${JSON.stringify(scholarshipSchema)}

Rules:
- If a field is not found in the text, use null
- Normalize degree levels to: "High School / Pre-U", "Bachelor / Undergraduate",
  "Master / Postgraduate", "PhD / Doctorate", "Postdoc / Fellowship",
  "Short Course / Summer School"
- Normalize funding types to: "Fully Funded", "Partial Tuition", "Tuition Only",
  "Stipend Only", "Research Grant"
- Extract ALL key requirements as a string array
- Extract deadline as YYYY-MM-DD if possible, otherwise descriptive text
- Include the source URL in a "source_url" field
- If multiple scholarships are found, return an array
`;
```

### 3.6 Implementation Location
- `/src/discovery/` directory:
  - `scraper.ts` — fetch + clean HTML
  - `extractor.ts` — Gemini extraction calls
  - `pipeline.ts` — orchestrate scrape → extract → dedupe → store
  - `sources.ts` — list of URLs to scrape per run
  - `inngest.ts` — Inngest client + scheduled function

---

## Phase 4: Missing AI Endpoints

### 4.1 Implement in Server
The `AiAssistantView.tsx` calls 3 endpoints that don't exist:

```
POST /api/v1/ai/diagnose-fit
  Input: { profile, scholarship }
  Output: { committeePerspective, rejectionRisks[], actionPlan[], suggestedChecklist[] }

POST /api/v1/ai/draft-sop
  Input: { profile, scholarship, customNotes, tone }
  Output: { letterDraft, outline[], tips[] }

POST /api/v1/ai/review-essay
  Input: { essayText, scholarshipTitle, scholarshipRequirements }
  Output: { overallScore, clarityScore, alignmentScore, impactScore,
            summary, strengths[], weaknesses[], suggestedEdits[] }
```

### 4.2 Gemini Prompts
Each endpoint needs a carefully crafted prompt that:
- Uses the user's profile + scholarship data
- Returns structured JSON matching the response schema
- Has fallback responses when API is down/limited

---

## Phase 5: Frontend Cleanup

### 5.1 Remove Dead Code
- Delete `src/utils/storage.ts` (duplicate of db.ts, uses v1 keys)
- Remove `src/components/ApplicationsTrackerView.tsx` (duplicate of ApplicationTracker.tsx)
- Clean up dead props: `onOpenAiSummary` in ScholarshipCard, `userProfile` in ApplicationTracker, `savedCount` in Navbar

### 5.2 Add Auth UI
- Login/Signup modal or page
- Auth context provider wrapping the app
- Protected routes
- Profile auto-creation on first login

### 5.3 Fix Existing Issues
- `AddScholarshipModal.tsx` hardcoded placeholders → use AI extraction when user submits a URL
- Missing `og:image` and `twitter:image` meta tags
- `ApplicationTracker.tsx` has dead props to wire up

### 5.4 Responsive + Mobile Polish
- Already mostly responsive, but review modal sizing on small screens
- Test touch interactions for checklist toggles

---

## Phase 6: Deploy + Android Prep

### 6.1 Vercel Deployment
- `vercel.json` with cron config
- Environment variables in Vercel dashboard
- Supabase connection pooling (Supaviser or direct)

### 6.2 Flutter API Contract
- Document all REST endpoints with request/response examples
- The Flutter app will use `supabase_flutter` SDK for auth + direct DB access
- REST API as supplementary layer for AI features + complex queries

### 6.3 Monitoring
- Inngest dashboard for discovery job health
- Supabase dashboard for DB + auth metrics
- Vercel analytics for frontend performance

---

## Execution Order

| Step | What | Depends On |
|------|------|------------|
| 1 | Create Supabase project + run schema SQL | User action |
| 2 | Install `@supabase/supabase-js`, create client | Step 1 |
| 3 | Seed existing scholarships into Supabase | Step 1 |
| 4 | Build API routes (CRUD for all tables) | Step 2, 3 |
| 5 | Add auth UI (login/signup) | Step 4 |
| 6 | Migrate frontend from localStorage to API calls | Step 4, 5 |
| 7 | Implement 3 missing AI endpoints | Step 4 |
| 8 | Build discovery engine (scraper + extractor) | Step 4 |
| 9 | Set up Inngest scheduler | Step 8 |
| 10 | Cleanup dead code + polish | Step 6, 7, 8 |
| 11 | Deploy to Vercel | Step 9, 10 |
| 12 | Test end-to-end | Step 11 |
| 13 | Document API for Flutter | Step 11 |

---

## Files to Create/Modify

### New Files
```
src/lib/supabase.ts              — Supabase client singleton
src/lib/auth.tsx                 — Auth context + provider
src/api/                         — API route handlers
  ├── scholarships.ts
  ├── profile.ts
  ├── saved.ts
  ├── applications.ts
  ├── checklists.ts
  ├── ai.ts
  └── backup.ts
src/discovery/
  ├── scraper.ts
  ├── extractor.ts
  ├── pipeline.ts
  ├── sources.ts
  └── inngest.ts
src/types/database.ts            — Supabase generated types
vercel.json                      — Vercel config + cron
```

### Files to Modify
```
package.json                      — Add @supabase/supabase-js, inngest
src/App.tsx                       — Add auth provider, API-based data loading
src/utils/db.ts                   — Rewrite to use API calls instead of localStorage
src/components/ProfileModal.tsx   — Wire to API
src/components/ScholarshipCard.tsx — Remove dead prop
src/components/Navbar.tsx         — Remove dead prop, add auth UI
src/components/AddScholarshipModal.tsx — URL-based AI extraction
src/components/AiAssistantView.tsx — Fix API endpoint URLs
src/server.ts                     — Add all missing routes
.env.example                      — Update with Supabase vars
```

### Files to Delete
```
src/utils/storage.ts              — Dead code (v1 duplicate)
src/components/ApplicationsTrackerView.tsx — Duplicate component
```

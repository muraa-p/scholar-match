# ScholarMatch — Global Scholarship Discovery & Opportunity Portal

Find scholarships across the internet matching your academic profile, with verified requirements, financial breakdowns, direct application links, official contacts, and milestone checklists.

## Stack

| Layer | Tech | Notes |
|-------|------|-------|
| **Frontend** | React 19 + Vite + TypeScript + Tailwind | SPA, dark/light mode |
| **Backend** | Express (serverless-ready) | AI + discovery routes |
| **Database + Auth** | Supabase (PostgreSQL + RLS + Auth) | 8 tables, per-user RLS |
| **AI** | Google Gemini (`gemini-3.7-flash`) | Summaries, diagnostics, SOP drafting, essay review |
| **Background jobs** | Inngest | Scheduled scholarship discovery cron |
| **Mobile** | Flutter (planned) | Consumes the same Supabase DB + REST API |

## Requirements

- Node.js 20+
- Supabase project (URL + anon key + service role key)
- Gemini API key (https://aistudio.google.com/apikey) — free tier
- Inngest account + signing key (optional, for scheduled discovery)
- Vercel account (optional, for hosting)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create your `.env` from the template:
   ```
   cp .env.example .env
   ```
   Fill in:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public client keys)
   - `GEMINI_API_KEY`
   - `INNGEST_SIGNING_KEY`
   - `DISCOVERY_RUN_TOKEN` (protects the manual discovery endpoint)
   - `APP_URL`

3. **Apply the database schema** — run `supabase/migrations/0001_initial_schema.sql` then `0002_notifications.sql` in the Supabase SQL Editor.

4. **Seed the initial scholarships**:
   ```
   npm run seed
   ```

5. Run the app:
   ```
   npm run dev
   ```
   Open http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run dev server (Express + Vite) |
| `npm run seed` | Load 21 seed scholarships into Supabase |
| `npm run build` | Production build (Vite + esbuild server bundle) |
| `npm start` | Run production build |
| `npm run lint` | TypeScript typecheck |

## API Routes

### AI
- `POST /api/ai/summarize` — concise scholarship summary (Gemini, cached)
- `POST /api/ai/diagnose-fit` — rejection-risk diagnostic
- `POST /api/ai/draft-sop` — motivation letter / statement writer
- `POST /api/ai/review-essay` — essay scoring + revision suggestions

**All AI endpoints require a valid Supabase session** — send the access token as `Authorization: Bearer <token>` (Supabase `getSession()` → `access_token`). They return deterministic fallbacks if Gemini is unreachable/rate-limited, so the app never breaks on flaky networks.

### Discovery
- `POST /api/v1/discovery/run` — trigger a discovery run manually (requires `x-discovery-token` header when `DISCOVERY_RUN_TOKEN` is set)
- `/api/v1/inngest` — Inngest handler for scheduled discovery (daily cron)

### Health
- `GET /api/health`

## Database Schema

Eight tables (see `supabase/migrations/0001_initial_schema.sql`):

- `scholarships` — discovered + seed opportunities (public read)
- `user_profiles` — one row per auth user (auto-created on signup)
- `saved_scholarships` — user bookmarks
- `tracked_applications` — applications a user is pursuing
- `checklists` — milestone items per application
- `communication_log` — coordinator/contact correspondence
- `ai_summaries` — cached AI summaries
- `discovery_log` — audit trail of discovery runs

Row Level Security is enabled: users can only read/write their own data; scholarships and AI summaries are public-read.

## Scholarship Discovery

The discovery engine is **keyless and quota-free**: it fetches Google News RSS search feeds (5 query angles) plus an always-merged curated catalog of real international scholarships (MEXT, Vanier, Gates Cambridge, Clarendon, etc.). It runs:
- **Automatically** — daily via Inngest cron (`0 2 * * *`)
- **Manually** — `POST /api/v1/discovery/run` with `x-discovery-token` header

Discovered scholarships are deduplicated by source URL and written to the `scholarships` table. Deadlines are computed at load time; scholarships past their deadline are hidden automatically.

## Features

- **Explorer** — search, filter (degree, country, funding, match score), sort, save/track
- **AI match scoring** — degree, field, GPA, work experience, country, funding fit
- **Detailed scholarship dossier** — coverage breakdown, requirements, rejection pitfalls, insider tips, contacts
- **Dynamic checklists** — per-scholarship milestone tracking with progress
- **Application tracker** — pipeline status (considering → accepted), notes, communication log
- **AI assistant** — rejection diagnostic, SOP drafter, essay reviewer
- **Dark/light mode** — system-aware, no flash-of-wrong-theme

## Flutter (Android) App — Roadmap

The data layer is API-first so a Flutter app can reuse it directly:
- Use the **Supabase Dart/Flutter SDK** for auth + realtime sync
- Use the same tables via the REST API for AI features and complex queries
- Test on the Android emulator / physical device, then export

## Deployment (Vercel)

1. Push to GitHub and import into Vercel
2. Set all env vars in the Vercel dashboard (`SUPABASE_*`, `VITE_*`, `GEMINI_API_KEY`, `INNGEST_SIGNING_KEY`)
3. Connect the Inngest signing key and deploy the function
4. `vercel.json` is configured if needed for cron/serverless

## Security Notes

- The **anon key must never be treated as secret** (it's public by design). It's used client-side.
- The **service role key** bypasses RLS — only ever use it server-side (seed, discovery, cron). Never expose it to the browser.
- The manual discovery endpoint is protected by `DISCOVERY_RUN_TOKEN` in production.

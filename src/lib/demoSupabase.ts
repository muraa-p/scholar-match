/**
 * Offline Supabase-compatible client.
 *
 * Implements just enough of the supabase-js surface for this app to run with no
 * backend at all: the query builder (select / insert / upsert / update / delete,
 * eq / in / order / limit / single) plus the auth methods used in lib/auth.tsx.
 * Everything is persisted to localStorage and seeded with a demo user.
 *
 * This is a fallback, not a replacement. Set VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY (see .env.example) and the real client is used instead,
 * with the real Postgres schema untouched.
 */
import { initialScholarships } from '../data/scholarshipsData';

const NS = 'scholarmatch_demo';
const SESSION_KEY = `${NS}_session`;
const SEED_KEY = `${NS}_seeded`;

export const DEMO_EMAIL = 'demo@scholarmatch.app';
export const DEMO_PASSWORD = 'demo1234';
export const DEMO_USER_ID = '00000000-0000-4000-a000-0000000000d1';

const uid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

// ---------------------------------------------------------------- storage
function read(table: string): any[] {
  try {
    return JSON.parse(localStorage.getItem(`${NS}_${table}`) || '[]');
  } catch {
    return [];
  }
}
function write(table: string, rows: any[]) {
  localStorage.setItem(`${NS}_${table}`, JSON.stringify(rows));
}
const clearAll = () => {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(`${NS}_`) && !k.endsWith('_seeded'))
    .forEach((k) => localStorage.removeItem(k));
};

// ---------------------------------------------------------------- seed
function seed() {
  if (localStorage.getItem(SEED_KEY)) return;
  const s = initialScholarships;
  const pick = (n: number) => s.slice(0, Math.min(n, s.length));

  write('user_profiles', [
    {
      id: DEMO_USER_ID,
      name: 'Demo Applicant',
      nationality: 'Somalia',
      current_degree: 'Bachelor / Undergraduate',
      target_degree: 'Master / Postgraduate',
      gpa: 3.7,
      field_of_study: 'Computer Science',
      target_countries: ['United Kingdom', 'Canada', 'Germany'],
      work_experience_years: 1,
      english_proficiency: 'ielts_toefl_ready',
      ielts_score: 7.0,
      funding_need: 'full_only',
      target_year: '2027/2028',
      previous_rejections_description: 'Strong grades, thin extracurriculars.',
      onboarding_completed: true,
      notifications: { newMatches: true, deadlineReminders: true, email: 'demo@scholarmatch.app' },
      updated_at: new Date().toISOString(),
    },
  ]);

  write('saved_scholarships', pick(3).map((x) => ({ user_id: DEMO_USER_ID, scholarship_id: x.id })));

  const now = Date.now();
  const apps = pick(2).map((x, i) => ({
    id: `demo-app-${i + 1}`,
    user_id: DEMO_USER_ID,
    scholarship_id: x.id,
    custom_title: x.title,
    status: i === 0 ? 'submitted' : 'preparing',
    applied_date: i === 0 ? new Date(now - 86400000 * 6).toISOString().slice(0, 10) : null,
    deadline: x.deadline || null,
    portal_url: x.officialApplicationUrl || null,
    personal_notes:
      i === 0
        ? 'Reference letter requested from Dr. Hassan. Waiting on the supervisor.'
        : 'Shortlist the recommendation letters, then re-read the essay prompt.',
    draft_motivation_letter: null,
    ai_analysis_result: null,
    created_at: new Date(now - 86400000 * 12).toISOString(),
    updated_at: new Date(now - 86400000 * 6).toISOString(),
  }));
  write('tracked_applications', apps);

  const checklistTemplates: Array<[string, string, boolean]> = [
    ['Research the official requirements', 'Research', true],
    ['Request two reference letters', 'Documents', true],
    ['Write the motivation letter', 'Essay', false],
    ['Prepare transcripts and certificates', 'Documents', false],
    ['Submit before the deadline', 'Submit', false],
  ];
  write(
    'checklists',
    apps.flatMap((a, ai) =>
      checklistTemplates.map(([title, category, completed], i) => ({
        id: `demo-cl-${ai}-${i}`,
        application_id: a.id,
        title,
        category,
        completed,
        notes: null,
        due_date: null,
        sort_order: i,
      }))
    )
  );

  write('communication_log', [
    {
      id: 'demo-log-1',
      application_id: apps[0]?.id ?? 'demo-app-1',
      date: new Date(now - 86400000 * 3).toISOString().slice(0, 10),
      recipient: 'admissions@example.edu',
      topic: 'Reference letter status',
      notes: 'Confirmed they received the first reference. Second one pending.',
      replied: false,
    },
  ]);

  // Scholarships table mirrors the bundled static data so joins resolve.
  write(
    'scholarships',
    s.map((x: any, i: number) => ({
      id: x.id || `demo-sch-${i}`,
      external_id: null,
      title: x.title,
      provider: x.provider,
      university: x.university ?? null,
      host_country: x.hostCountry,
      degree_levels: x.degreeLevels ?? [],
      fields_of_study: x.fieldsOfStudy ?? [],
      funding_type: x.fundingType,
      financial_coverage: x.financialCoverage ?? {},
      deadline: x.deadline || null,
      deadline_status: 'open',
      summary: x.summary ?? null,
      key_requirements: x.keyRequirements ?? [],
      eligibility_criteria: x.eligibilityCriteria ?? {},
      rejection_pitfalls: x.rejectionPitfalls ?? [],
      insider_tips: x.insiderTips ?? [],
      official_application_url: x.officialApplicationUrl ?? null,
      contacts: x.contacts ?? {},
      default_checklist: x.defaultChecklist ?? [],
      is_custom: false,
      is_active: true,
    }))
  );

  localStorage.setItem(SEED_KEY, '1');
}

// ---------------------------------------------------------------- query builder
type Filter = { col: string; op: 'eq' | 'in'; val: any };

class QueryBuilder {
  private table: string;
  private op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private filters: Filter[] = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;
  private wantSingle = false;
  private head = false;
  private payload: any = null;
  private conflict: string[] = [];

  constructor(table: string) {
    this.table = table;
  }

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.head) this.head = true;
    return this;
  }
  insert(rows: any) {
    this.op = 'insert';
    this.payload = rows;
    return this;
  }
  upsert(row: any, opts?: { onConflict?: string }) {
    this.op = 'upsert';
    this.payload = row;
    this.conflict = (opts?.onConflict || 'id').split(',').map((c) => c.trim());
    return this;
  }
  update(patch: any) {
    this.op = 'update';
    this.payload = patch;
    return this;
  }
  delete() {
    this.op = 'delete';
    return this;
  }
  eq(col: string, val: any) {
    this.filters.push({ col, op: 'eq', val });
    return this;
  }
  in(col: string, vals: any[]) {
    this.filters.push({ col, op: 'in', val: vals || [] });
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending !== false;
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  single() {
    this.wantSingle = true;
    return this;
  }

  private matches(row: any) {
    return this.filters.every((f) =>
      f.op === 'eq' ? row[f.col] === f.val : (f.val || []).includes(row[f.col])
    );
  }

  private run(): { data: any; error: any; count?: number } {
    seed();
    const rows = read(this.table);
    const now = () => new Date().toISOString();

    switch (this.op) {
      case 'insert': {
        const incoming = Array.isArray(this.payload) ? this.payload : [this.payload];
        const created = incoming.map((r: any) => ({ id: r.id || uid(), created_at: r.created_at || now(), updated_at: r.updated_at || now(), ...r }));
        write(this.table, [...rows, ...created]);
        const last = created[created.length - 1];
        return { data: this.wantSingle ? last : created, error: null };
      }
      case 'upsert': {
        const incoming = this.payload;
        const idx = rows.findIndex((r) => this.conflict.every((c) => r[c] === incoming[c]));
        if (idx >= 0) {
          const merged = { ...rows[idx], ...incoming, updated_at: now() };
          const next = [...rows];
          next[idx] = merged;
          write(this.table, next);
          return { data: this.wantSingle ? merged : merged, error: null };
        }
        const created = { id: incoming.id || uid(), created_at: now(), updated_at: now(), ...incoming };
        write(this.table, [...rows, created]);
        return { data: this.wantSingle ? created : created, error: null };
      }
      case 'update': {
        const next = rows.map((r) => (this.matches(r) ? { ...r, ...this.payload, updated_at: now() } : r));
        write(this.table, next);
        return { data: next.filter((r) => this.matches(r)), error: null };
      }
      case 'delete': {
        const next = rows.filter((r) => !this.matches(r));
        write(this.table, next);
        return { data: next, error: null };
      }
      default: {
        // Note: must be an arrow — passing this.matches bare loses the binding.
        let result = rows.filter((r) => this.matches(r));
        if (this.orderCol) {
          const col = this.orderCol;
          result = [...result].sort((a, b) => {
            const av = a[col];
            const bv = b[col];
            if (av === bv) return 0;
            return (av > bv ? 1 : -1) * (this.orderAsc ? 1 : -1);
          });
        }
        if (this.limitN) result = result.slice(0, this.limitN);
        if (this.head) return { data: null, error: null, count: result.length };
        if (this.wantSingle) {
          const row = result[0] ?? null;
          return { data: row, error: row ? null : { message: 'No rows returned' } };
        }
        return { data: result, error: null };
      }
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((v: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((r: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve()
      .then(() => this.run())
      .then(onfulfilled as any, onrejected as any);
  }
}

// ---------------------------------------------------------------- auth
function makeSession() {
  const expires_at = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  return {
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    token_type: 'bearer',
    expires_in: expires_at,
    expires_at,
    user: {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      user_metadata: { name: 'Demo Applicant' },
    },
  } as any;
}

const listeners: Array<(e: string, s: any) => void> = [];

export const demoAuth = {
  async getSession() {
    seed();
    const raw = localStorage.getItem(SESSION_KEY);
    return { data: { session: raw ? JSON.parse(raw) : null }, error: null };
  },
  async getUser() {
    const { data } = await this.getSession();
    return { data: { user: data.session?.user ?? null }, error: null };
  },
  onAuthStateChange(cb: (e: string, s: any) => void) {
    listeners.push(cb);
    return { data: { subscription: { unsubscribe: () => {} } } };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    seed();
    if (
      email.trim().toLowerCase() !== DEMO_EMAIL ||
      password !== DEMO_PASSWORD
    ) {
      return { data: { user: null, session: null }, error: { message: 'Use the demo account shown below.' } };
    }
    const session = makeSession();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    listeners.forEach((l) => l('SIGNED_IN', session));
    return { data: { user: session.user, session }, error: null };
  },
  async signUp() {
    return {
      data: { user: null, session: null },
      error: { message: 'Sign-up needs a database. Explore the demo instead.' },
    };
  },
  async signOut() {
    localStorage.removeItem(SESSION_KEY);
    listeners.forEach((l) => l('SIGNED_OUT', null));
    return { error: null };
  },
  async signInWithOAuth() {
    return { data: { provider: 'google' }, error: { message: 'Google sign-in needs a database.' } };
  },
  async refreshSession() {
    const { data } = await this.getSession();
    return { data: { session: data.session, user: data.session?.user ?? null }, error: null };
  },
};

/** Seed + optionally drop an existing demo session. Used by the demo button. */
export function startDemoSession() {
  seed();
  const session = makeSession();
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  listeners.forEach((l) => l('SIGNED_IN', session));
  return session;
}

export function resetDemoData() {
  clearAll();
  localStorage.removeItem(SEED_KEY);
  localStorage.removeItem(SESSION_KEY);
  seed();
}

export function createDemoClient() {
  seed();
  return {
    auth: demoAuth,
    from: (table: string) => new QueryBuilder(table),
  } as any;
}

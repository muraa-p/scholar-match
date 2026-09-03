// Self-contained Vercel serverless handler.  Every import here is an npm
// package — there are ZERO relative imports to project files so Vercel's
// @vercel/node builder can compile this into a working lambda without needing
// to copy any other source files into /var/task.
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { Inngest } from 'inngest';
import { serve } from 'inngest/express';
import Parser from 'rss-parser';

dotenv.config();

// ================================================================
// Supabase admin client
// ================================================================
const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Client-side (anon key) client used to verify a user's Bearer JWT.  The
// service-role key must NOT be used to validate end-user tokens, so we
// build a separate client rooted at the anon key.
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const anonClient = anonKey
  ? createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

// Middleware: require a valid Supabase access token (Authorization: Bearer <jwt>)
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  if (!token) return res.status(401).json({ error: 'Missing access token' });
  if (!anonClient) return res.status(500).json({ error: 'Auth not configured' });
  try {
    const { data, error } = await anonClient.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired token' });
    (req as any).user = data.user;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ================================================================
// Gemini client
// ================================================================
let cachedGemini: GoogleGenAI | null | undefined;
function getGeminiClient(): GoogleGenAI | null {
  if (cachedGemini !== undefined) return cachedGemini;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { cachedGemini = null; return null; }
  cachedGemini = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
  return cachedGemini;
}
const GEMINI_MODEL = 'gemini-3.7-flash';

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, rej) => { timer = setTimeout(() => rej(new Error(`Gemini timeout ${ms}ms`)), ms); });
  try { return await Promise.race([promise, timeout]); } finally { clearTimeout(timer as unknown as NodeJS.Timeout); }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJson<T>(ai: GoogleGenAI, prompt: string, schema: any, timeoutMs = 25000, retries = 3): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt, config: { responseMimeType: 'application/json', responseSchema: schema } }),
        timeoutMs,
      );
      if (!response.text) return null;
      const cleaned = response.text.trim().replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (e) {
      const msg = (e as Error).message || '';
      if (attempt < retries && /429|503|quota|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand/.test(msg)) {
        await sleep(2000 * Math.pow(2, attempt));
        continue;
      }
      console.error('Gemini fetchJson error:', msg);
      return null;
    }
  }
  return null;
}

// ================================================================
// AI cache
// ================================================================
const cache = new Map<string, { data: any; timestamp: number }>();
const TTL = 1000 * 60 * 60 * 24;
function hitCache(key: string) { const e = cache.get(key); return e && Date.now() - e.timestamp < TTL ? e.data : null; }
function setCache(key: string, data: any) { cache.set(key, { data, timestamp: Date.now() }); }

// ================================================================
// Discovery
// ================================================================
const DISCOVERY_FEEDS = [
  'https://news.google.com/rss/search?q=' + encodeURIComponent('fully funded scholarship 2026 application deadline') + '&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=' + encodeURIComponent('("scholarship" OR "scholarships") application open') + '&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=' + encodeURIComponent('("PhD scholarship" OR "masters scholarship") fully funded 2026') + '&hl=en-US&gl=US&ceid=US:en',
];

const CURATED_FALLBACK = [
  { title: 'Chevening Scholarships', provider: 'UK Foreign, Commonwealth & Development Office', hostCountry: 'United Kingdom', degreeLevels: ['Master / Postgraduate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://www.chevening.org/scholarships/' },
  { title: 'Fulbright Foreign Student Program', provider: 'U.S. Department of State', hostCountry: 'United States', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://foreign.fulbrightonline.org/' },
  { title: 'DAAD Development-Related Postgraduate Courses (EPOS)', provider: 'German Academic Exchange Service (DAAD)', hostCountry: 'Germany', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/' },
  { title: 'Eiffel Excellence Scholarship Program', provider: 'French Ministry for Europe and Foreign Affairs', hostCountry: 'France', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://www.campusfrance.org/en/the-programme-eiffel' },
  { title: 'Rhodes Scholarship', provider: 'The Rhodes Trust', hostCountry: 'United Kingdom', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://www.rhodeshouse.ox.ac.uk/' },
  { title: 'Commonwealth Scholarship', provider: 'Commonwealth Scholarship Commission', hostCountry: 'United Kingdom', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://cscuk.fcdo.gov.uk/' },
  { title: 'Erasmus Mundus Joint Masters', provider: 'European Union (EACEA)', hostCountry: 'Multiple', degreeLevels: ['Master / Postgraduate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://www.eacea.ec.europa.eu/scholarships/erasus-mundus-catalogue_en' },
  { title: 'Australia Awards', provider: 'Australian Department of Foreign Affairs and Trade', hostCountry: 'Australia', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://www.dfat.gov.au/people-to-people/australia-awards' },
  { title: 'Knight-Hennessy Scholars', provider: 'Stanford University', hostCountry: 'United States', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://knight-hennessy.stanford.edu/' },
];

function inferFundingType(text: string) {
  const t = (text || '').toLowerCase();
  if (t.includes('fully funded') || t.includes('fully-funded')) return 'Fully Funded';
  if (t.includes('partial')) return 'Partial Tuition';
  return 'Fully Funded';
}

async function fetchFeed(url: string) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  let xml: string;
  try { const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); xml = await res.text(); }
  catch (e) { throw new Error(`Feed request failed: ${(e as Error).message}`); }
  finally { clearTimeout(timer); }
  const parser = new Parser();
  const feed = await parser.parseString(xml);
  const items = (feed?.items || []) as any[];
  const sourceName = (feed?.title as string) || url;
  const results: any[] = [];
  for (const item of items) {
    const title = (item.title || '').trim();
    if (!title) continue;
    const link = item.link || '';
    const text = `${item.content || ''} ${item.contentSnippet || ''} ${(item.categories || []).join(' ')}`;
    results.push({
      title: title.replace(/<[^>]+>/g, '').slice(0, 200),
      provider: sourceName, university: undefined, hostCountry: 'Multiple',
      degreeLevels: ['Master / Postgraduate'], fieldsOfStudy: ['All / Any Field'],
      fundingType: inferFundingType(text), deadline: undefined,
      summary: (item.contentSnippet || '').slice(0, 300), keyRequirements: [],
      officialApplicationUrl: link || undefined, contacts: {},
      sourceUrl: link || `${url}#${title.slice(0, 40)}`, sourceName,
    });
  }
  return results.slice(0, 15);
}

async function runDiscoveryRun(_query: string): Promise<{ results: number; errors: number }> {
  const candidates: any[] = [];
  let feedSucceeded = 0;
  for (const url of DISCOVERY_FEEDS) {
    try { const items = await fetchFeed(url); feedSucceeded++; candidates.push(...items); }
    catch (e) { console.warn(`Feed failed (${url}):`, (e as Error).message); }
  }
  const sourceList: Array<[any, string]> = candidates.length > 0
    ? candidates.map((s) => [s, 'google-news-search'])
    : CURATED_FALLBACK.map((c) => [{ title: c.title, provider: c.provider, hostCountry: c.hostCountry, degreeLevels: c.degreeLevels, fieldsOfStudy: ['All / Any Field'], fundingType: c.fundingType, officialApplicationUrl: c.officialApplicationUrl, sourceUrl: c.officialApplicationUrl, sourceName: c.provider, keyRequirements: [], contacts: {}, summary: '' }, 'curated-fallback']);

  const inserted = await persistBatch(sourceList);
  const note = candidates.length > 0
    ? `${feedSucceeded}/${DISCOVERY_FEEDS.length} feeds parsed (google-news-search)`
    : `All ${DISCOVERY_FEEDS.length} feeds unreachable; used curated fallback`;
  await logDiscovery('feed-discovery', 'completed', inserted, note);
  return { results: inserted, errors: 0 };
}

async function persistBatch(sourceList: Array<[any, string]>): Promise<number> {
  let insertedForUpsert = 0;
  const now = new Date().toISOString();
  let existing = new Set<string>();
  try { const { data } = await admin.from('scholarships').select('external_id'); existing = new Set((data || []).map((r: any) => r.external_id).filter(Boolean)); }
  catch (e) { console.warn('Could not load existing external_ids:', (e as Error).message); }
  const seenInBatch = new Set<string>();
  const batch: Record<string, unknown>[] = [];
  for (const [s, sourceName] of sourceList) {
    if (!s.title || !s.provider) continue;
    const ref = s.sourceUrl || '';
    if (ref) { if (existing.has(ref) || seenInBatch.has(ref)) continue; seenInBatch.add(ref); }
    batch.push({
      external_id: ref || null, title: s.title, provider: s.provider, university: s.university || null,
      host_country: s.hostCountry || 'Multiple', degree_levels: s.degreeLevels || ['Master / Postgraduate'],
      fields_of_study: s.fieldsOfStudy || ['All / Any Field'], funding_type: s.fundingType || 'Fully Funded',
      deadline: s.deadline || null, deadline_status: 'open', summary: s.summary || '',
      key_requirements: s.keyRequirements || [], eligibility_criteria: {}, rejection_pitfalls: [], insider_tips: [],
      official_application_url: s.officialApplicationUrl || null, contacts: s.contacts || {},
      source_url: s.sourceUrl || null, source_name: sourceName, last_verified_at: now, is_custom: false, is_active: true,
    });
  }
  if (batch.length === 0) return 0;
  const CHUNK = 25;
  for (let i = 0; i < batch.length; i += CHUNK) {
    const chunk = batch.slice(i, i + CHUNK);
    const { error, count } = await admin.from('scholarships').upsert(chunk, { onConflict: 'external_id', count: 'exact' });
    if (error) console.error('Batch upsert failed:', error.message);
    else insertedForUpsert += (count ?? chunk.length);
  }
  return insertedForUpsert;
}

async function logDiscovery(query: string, status: string, found: number, error?: string | null) {
  try { await admin.from('discovery_log').insert({ source_url: query, source_name: 'feed-discovery', status, scholarships_found: found, error_message: error || null }); }
  catch (e) { console.error('Failed to write discovery_log:', (e as Error).message); }
}

// ================================================================
// Inngest
// ================================================================
const inngest = new Inngest({ id: 'scholarmatch' });
const discoveryJob = inngest.createFunction(
  { id: 'run-scholarship-discovery', retries: 2, triggers: [{ cron: '0 2 * * *' }] },
  async ({ step }) => step.run('discover-feeds', () => runDiscoveryRun('')),
);
const manualDiscoveryRun = inngest.createFunction(
  { id: 'manual-scholarship-discovery-run', triggers: [{ event: 'scholarmatch/discovery.manual' }] },
  async ({ step }) => step.run('discover-feeds', () => runDiscoveryRun('')),
);

// ================================================================
// Express app
// ================================================================
const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => { res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY }); });

// ---- AI routes ----
const aiRouter = express.Router();
aiRouter.use(requireAuth);

aiRouter.post('/summarize', async (req, res) => {
  const { scholarshipId, title, provider, hostCountry, fundingType, summary, keyRequirements, eligibilityCriteria } = req.body;
  if (!scholarshipId || !title) return res.status(400).json({ error: 'Missing scholarship ID or title' });
  const cached = hitCache(`summarize:${scholarshipId}`);
  if (cached) return res.json({ ...cached, fromCache: true });
  const fallback = {
    scholarshipId,
    overview: `${title} is a prestigious ${fundingType || ''} scholarship offered by ${provider || 'the provider'} in ${hostCountry || 'multiple locations'}.`,
    keyHighlights: ['Comprehensive funding covering core academic and living expenses.', 'Open to qualified international candidates meeting academic criteria.', 'Recognized award with a global alumni and research network.'],
    essentialRequirements: Array.isArray(keyRequirements) && keyRequirements.length > 0 ? keyRequirements.slice(0, 4) : ['Academic transcripts', 'Statement of Purpose / Motivation Letter', 'Letters of Recommendation', 'Proof of language proficiency'],
    targetCandidateProfile: `Applicants with a strong academic track record (${eligibilityCriteria?.minGpa ? `GPA ${eligibilityCriteria.minGpa}+` : 'competitive GPA'}).`,
    keyAdvice: 'Ensure your personal statement explicitly addresses your study goals and future career contribution.',
  };
  const ai = getGeminiClient();
  if (!ai) { setCache(`summarize:${scholarshipId}`, fallback); return res.json(fallback); }
  try {
    const data = await fetchJson<Record<string, any>>(ai, `You are a concise academic advisor. Summarize the following scholarship.\n\nScholarship: "${title}"\nProvider: ${provider}\nHost Country: ${hostCountry}\nFunding Type: ${fundingType}\nSummary: ${summary}\nRequirements: ${JSON.stringify(keyRequirements || [])}\nEligibility: ${JSON.stringify(eligibilityCriteria || {})}\n\nProvide: overview (1-2 sentences), keyHighlights (3 bullets), essentialRequirements (3-4 items), targetCandidateProfile (1 sentence), keyAdvice (1 actionable tip).`, { type: Type.OBJECT, properties: { overview: { type: Type.STRING }, keyHighlights: { type: Type.ARRAY, items: { type: Type.STRING } }, essentialRequirements: { type: Type.ARRAY, items: { type: Type.STRING } }, targetCandidateProfile: { type: Type.STRING }, keyAdvice: { type: Type.STRING } }, required: ['overview', 'keyHighlights', 'essentialRequirements', 'targetCandidateProfile', 'keyAdvice'] });
    if (!data) return res.json(fallback);
    const parsed = { ...fallback, ...data, scholarshipId };
    setCache(`summarize:${scholarshipId}`, parsed);
    return res.json(parsed);
  } catch { return res.json(fallback); }
});

aiRouter.post('/diagnose-fit', async (req, res) => {
  const { profile, scholarship } = req.body;
  if (!profile || !scholarship) return res.status(400).json({ error: 'Missing profile or scholarship' });
  const cacheKey = `diag:${scholarship.id}:${profile.gpa}:${profile.fieldOfStudy}`;
  const cached = hitCache(cacheKey);
  if (cached) return res.json(cached);
  const fallback = {
    committeePerspective: `The ${scholarship.provider} selection committee seeks candidates who demonstrate clear alignment with "${scholarship.title}", strong academic readiness, and a compelling vision.`,
    rejectionRisks: [...(scholarship.rejectionPitfalls || []).slice(0, 3), ...(profile.gpa < (scholarship.eligibilityCriteria?.minGpa || 0) ? ['Your GPA may be below the stated minimum.'] : [])],
    actionPlan: ['Read the official eligibility criteria and map each one to evidence in your profile.', 'Draft a tailored statement directly addressing the committee mandate.', 'Secure 2-3 strong reference letters.', 'Prepare all transcripts early.'],
    suggestedChecklist: ['Create a requirements-to-evidence mapping table', 'Draft a customized motivation letter', 'Collect transcripts and reference letters', 'Book a language proficiency test'],
  };
  const ai = getGeminiClient();
  if (!ai) return res.json(fallback);
  try {
    const data = await fetchJson<Record<string, any>>(ai, `You are an elite scholarship admissions strategist. Diagnose why THIS candidate might get REJECTED and provide a turnaround plan.\n\nCandidate: ${JSON.stringify(profile)}\nScholarship: ${JSON.stringify({ title: scholarship.title, provider: scholarship.provider, hostCountry: scholarship.hostCountry, summary: scholarship.summary, keyRequirements: scholarship.keyRequirements, eligibilityCriteria: scholarship.eligibilityCriteria, rejectionPitfalls: scholarship.rejectionPitfalls })}\n\nReturn JSON: committeePerspective, rejectionRisks[], actionPlan[], suggestedChecklist[]`, { type: Type.OBJECT, properties: { committeePerspective: { type: Type.STRING }, rejectionRisks: { type: Type.ARRAY, items: { type: Type.STRING } }, actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } }, suggestedChecklist: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['committeePerspective', 'rejectionRisks', 'actionPlan', 'suggestedChecklist'] });
    if (!data) return res.json(fallback);
    const result = { ...fallback, ...data };
    setCache(cacheKey, result);
    return res.json(result);
  } catch { return res.json(fallback); }
});

aiRouter.post('/draft-sop', async (req, res) => {
  const { profile, scholarship, customNotes, tone } = req.body;
  if (!profile || !scholarship) return res.status(400).json({ error: 'Missing profile or scholarship' });
  const fallback = {
    letterDraft: `Dear Selection Committee,\n\nI am writing to express my strong interest in the ${scholarship.title} offered by ${scholarship.provider} in ${scholarship.hostCountry}.\n\nAs a ${profile.fieldOfStudy} professional with ${profile.workExperienceYears} years of experience and a ${profile.gpa.toFixed(2)} GPA, I am eager to pursue further study in this field.\n\n[Expand with your specific background, achievements, and why this program is the right fit for you.]\n\nThank you for considering my application.\n\nSincerely,\n${profile.name || 'Your Name'}`,
    outline: ['Introduction: who you are and the program', 'Academic background and relevant experience', 'Why this specific program and institution', 'Career goals and how this program enables them', 'Conclusion: reaffirm fit and thank the committee'],
    tips: ['Customize every paragraph to this specific scholarship', 'Quantify achievements wherever possible', 'Have 1-2 people review for clarity and authenticity'],
  };
  const ai = getGeminiClient();
  if (!ai) return res.json(fallback);
  const toneDescription: Record<string, string> = { persuasive_academic: 'Balanced academic rigor and persuasive storytelling', leadership_impact: 'Leadership and social impact focus', technical_research: 'Lab & research proposal focus', community_resilience: 'Overcoming adversity and community give-back focus' };
  try {
    const data = await fetchJson<Record<string, any>>(ai, `Draft a compelling motivation letter / statement of purpose.\n\nTone: ${toneDescription[tone] || toneDescription.persuasive_academic}\nCandidate: ${JSON.stringify(profile)}\nScholarship: ${JSON.stringify({ title: scholarship.title, provider: scholarship.provider, hostCountry: scholarship.hostCountry, summary: scholarship.summary, keyRequirements: scholarship.keyRequirements })}\nNotes: ${customNotes || 'None'}\n\nReturn JSON: letterDraft (500-700 words), outline[], tips[]`, { type: Type.OBJECT, properties: { letterDraft: { type: Type.STRING }, outline: { type: Type.ARRAY, items: { type: Type.STRING } }, tips: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['letterDraft', 'outline', 'tips'] });
    if (!data) return res.json(fallback);
    return res.json({ ...fallback, ...data });
  } catch { return res.json(fallback); }
});

aiRouter.post('/review-essay', async (req, res) => {
  const { essayText, scholarshipTitle, scholarshipRequirements } = req.body;
  if (!essayText || typeof essayText !== 'string') return res.status(400).json({ error: 'Missing essayText' });
  const fallback = { overallScore: 65, clarityScore: 68, alignmentScore: 62, impactScore: 60, summary: 'The essay shows effort but needs stronger structure and tighter alignment.', strengths: ['Clear overall message.', 'Relevant background context included.'], weaknesses: ['Could benefit from more specific examples.', 'Alignment with criteria could be strengthened.'], suggestedEdits: ['Add a strong opening hook.', 'Quantify achievements.', 'Connect goals to scholarship requirements.', 'Strengthen the conclusion.'] };
  const ai = getGeminiClient();
  if (!ai) return res.json(fallback);
  try {
    const data = await fetchJson<Record<string, any>>(ai, `Critique this essay against the scholarship criteria.\n\nScholarship: ${scholarshipTitle}\nRequirements: ${JSON.stringify(scholarshipRequirements || [])}\nEssay:\n"""\n${essayText}\n"""\n\nReturn JSON: overallScore (0-100), clarityScore, alignmentScore, impactScore, summary, strengths[], weaknesses[], suggestedEdits[]`, { type: Type.OBJECT, properties: { overallScore: { type: Type.INTEGER }, clarityScore: { type: Type.INTEGER }, alignmentScore: { type: Type.INTEGER }, impactScore: { type: Type.INTEGER }, summary: { type: Type.STRING }, strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, suggestedEdits: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['overallScore', 'clarityScore', 'alignmentScore', 'impactScore', 'summary', 'strengths', 'weaknesses', 'suggestedEdits'] });
    if (!data) return res.json(fallback);
    return res.json({ ...fallback, ...data });
  } catch { return res.json(fallback); }
});

app.use('/api/ai', aiRouter);

// ---- Discovery routes ----
const discoveryRouter = express.Router();
discoveryRouter.use('/inngest', serve({ client: inngest, functions: [discoveryJob, manualDiscoveryRun] }));
discoveryRouter.post('/discovery/run', async (req, res) => {
  const token = process.env.DISCOVERY_RUN_TOKEN;
  if (token && req.headers['x-discovery-token'] !== token) return res.status(401).json({ error: 'Unauthorized' });
  try { const result = await runDiscoveryRun(''); return res.json({ ok: true, results: result }); }
  catch (e) { return res.status(500).json({ ok: false, error: (e as Error).message }); }
});
app.use('/api/v1', discoveryRouter);

// ---- Static SPA serving (local / single-server deploys) ----
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use('/assets', express.static(path.join(distPath, 'assets')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'), (err) => { if (err) next(); });
  });
}

export default app;

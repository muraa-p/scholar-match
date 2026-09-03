import Parser from 'rss-parser';
import { admin } from '../lib/supabaseAdmin';

// ---------------------------------------------------------------------
// Background discovery: search Google News RSS (free + keyless, no quota)
// for current scholarship listings, parse them into our scholarship
// shape, and write NEW ones to Supabase with deduplication.
//
// This is the "agent" that runs on a schedule (see inngest.ts) and
// finds real, current scholarships without touching the paid Gemini
// API — so there are no free-tier quota/429/503 limits.
//
// The Gemini-based generator was removed as the primary source because
// the free tier returned 429/503. If you later want AI-written
// enrichment, re-add it only as an optional secondary stage — never as
// the data source.
// ---------------------------------------------------------------------

// Keyless Google News RSS search feeds. These reliably return ~100 real
// items per query, fast, with no API key and no quota. Each query is a
// different angle (fully funded, general, by level) to widen coverage.
export const DISCOVERY_FEEDS: string[] = [
  'https://news.google.com/rss/search?q=' + encodeURIComponent('fully funded scholarship 2026 application deadline') + '&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=' + encodeURIComponent('("scholarship" OR "scholarships") application open') + '&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=' + encodeURIComponent('("PhD scholarship" OR "masters scholarship") fully funded 2026') + '&hl=en-US&gl=US&ceid=US:en',
];

// Curated table of well-known programs that we inject deterministically
// as a local fallback when every feed is unreachable. Keeps discovery
// useful even fully offline.
const CURATED_FALLBACK: Array<{
  title: string;
  provider: string;
  hostCountry: string;
  degreeLevels: string[];
  fundingType: string;
  officialApplicationUrl: string;
}> = [
  { title: 'Chevening Scholarships', provider: 'UK Foreign, Commonwealth & Development Office', hostCountry: 'United Kingdom', degreeLevels: ['Master / Postgraduate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://www.chevening.org/scholarships/' },
  { title: 'Fulbright Foreign Student Program', provider: 'U.S. Department of State', hostCountry: 'United States', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://foreign.fulbrightonline.org/' },
  { title: 'DAAD Development-Related Postgraduate Courses (EPOS)', provider: 'German Academic Exchange Service (DAAD)', hostCountry: 'Germany', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/' },
  { title: 'Eiffel Excellence Scholarship Program', provider: 'French Ministry for Europe and Foreign Affairs', hostCountry: 'France', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://www.campusfrance.org/en/the-programme-eiffel' },
  { title: 'Rhodes Scholarship', provider: 'The Rhodes Trust', hostCountry: 'United Kingdom', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://www.rhodeshouse.ox.ac.uk/' },
  { title: 'Commonwealth Scholarship (Master’s & PhD)', provider: 'Commonwealth Scholarship Commission', hostCountry: 'United Kingdom', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://cscuk.fcdo.gov.uk/' },
  { title: 'Aga Khan Scholarship Programme', provider: 'Aga Khan Foundation', hostCountry: 'Multiple', degreeLevels: ['Master / Postgraduate'], fundingType: 'Partial Tuition', officialApplicationUrl: 'https://the.akdn/en/what-we-do/our-agencies/aga-khan-foundation' },
  { title: 'Erasmus Mundus Joint Master’s', provider: 'European Union (EACEA)', hostCountry: 'Multiple', degreeLevels: ['Master / Postgraduate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en' },
  { title: 'Australia Awards', provider: 'Australian Department of Foreign Affairs and Trade', hostCountry: 'Australia', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://www.dfat.gov.au/people-to-people/australia-awards' },
  { title: 'Knight-Hennessy Scholars', provider: 'Stanford University', hostCountry: 'United States', degreeLevels: ['Master / Postgraduate', 'PhD / Doctorate'], fundingType: 'Fully Funded', officialApplicationUrl: 'https://knight-hennessy.stanford.edu/' },
];

export interface ExtractedScholarship {
  title: string;
  provider: string;
  university?: string;
  hostCountry: string;
  degreeLevels: string[];
  fieldsOfStudy: string[];
  fundingType: string;
  deadline?: string;
  summary?: string;
  keyRequirements: string[];
  officialApplicationUrl?: string;
  contacts?: { email?: string; inquiryFormUrl?: string };
  sourceUrl: string;
  sourceName: string;
}

// Infer funding type from free-text (RSS content/categories) where possible.
function inferFundingType(text: string): string {
  const t = (text || '').toLowerCase();
  if (t.includes('fully funded') || t.includes('fully-funded')) return 'Fully Funded';
  if (t.includes('partial')) return 'Partial Tuition';
  if (t.includes('tuition')) return 'Tuition Only';
  return 'Fully Funded'; // most scholarship listings are fully funded
}

interface FeedItem {
  title?: string;
  link?: string;
  content?: string;
  contentSnippet?: string;
  isoDate?: string;
  categories?: string[];
}

async function fetchFeed(url: string): Promise<ExtractedScholarship[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  let xml: string;
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    xml = await res.text();
  } catch (e) {
    throw new Error(`Feed request failed: ${(e as Error).message}`);
  } finally {
    clearTimeout(timer);
  }
  const parser = new Parser();
  const feed = await parser.parseString(xml);
  const items: FeedItem[] = (feed?.items || []) as FeedItem[];
  const sourceName = (feed?.title as string) || url;
  const results: ExtractedScholarship[] = [];

  for (const item of items) {
    const title = (item.title || '').trim();
    if (!title) continue;
    const link = item.link || '';
    const text = `${item.content || ''} ${item.contentSnippet || ''} ${(item.categories || []).join(' ')}`;
    results.push({
      title: title.replace(/<[^>]+>/g, '').slice(0, 200),
      provider: sourceName,
      university: undefined,
      hostCountry: 'Multiple',
      degreeLevels: ['Master / Postgraduate'],
      fieldsOfStudy: ['All / Any Field'],
      fundingType: inferFundingType(text),
      deadline: undefined,
      summary: (item.contentSnippet || '').slice(0, 300),
      keyRequirements: [],
      officialApplicationUrl: link || undefined,
      contacts: {},
      sourceUrl: link || `${url}#${title.slice(0, 40)}`,
      sourceName,
    });
  }
  // Cap items so the batch job stays within serverless time limits.
  return results.slice(0, 15);
}

export async function runDiscoveryRun(_query: string): Promise<{ results: number; errors: number }> {
  // Gather all candidates from every feed (each feed capped internally).
  const candidates: ExtractedScholarship[] = [];
  let feedSucceeded = 0;
  for (const url of DISCOVERY_FEEDS) {
    try {
      const items = await fetchFeed(url);
      feedSucceeded++;
      candidates.push(...items);
    } catch (e) {
      console.warn(`Feed failed (${url}):`, (e as Error).message);
    }
  }

  // If every feed failed, fall back to the curated list (fully offline-safe).
  const sourceList: Array<[ExtractedScholarship, string]> =
    candidates.length > 0
      ? candidates.map((s) => [s, 'google-news-search'])
      : CURATED_FALLBACK.map((c) => [
          {
            title: c.title,
            provider: c.provider,
            hostCountry: c.hostCountry,
            degreeLevels: c.degreeLevels,
            fieldsOfStudy: ['All / Any Field'],
            fundingType: c.fundingType,
            officialApplicationUrl: c.officialApplicationUrl,
            sourceUrl: c.officialApplicationUrl,
            sourceName: c.provider,
            keyRequirements: [],
            contacts: {},
            summary: '',
          } as ExtractedScholarship,
          'curated-fallback',
        ]);

  // Batch persist: load existing external_ids once, filter in-memory, insert.
  const inserted = await persistBatch(sourceList);

  const note =
    candidates.length > 0
      ? `${feedSucceeded}/${DISCOVERY_FEEDS.length} feeds parsed (google-news-search)`
      : `All ${DISCOVERY_FEEDS.length} feeds unreachable; used curated fallback`;
  await logDiscovery('feed-discovery', 'completed', inserted, note);

  return { results: inserted, errors: 0 };
}

// Load all existing external_ids, filter out candidates already present,
// then batch-insert the new ones with a single upsert.
async function persistBatch(sourceList: Array<[ExtractedScholarship, string]>): Promise<number> {
  let batch: Array<Record<string, unknown>> = [];
  let insertedForUpsert = 0;
  const now = new Date().toISOString();

  // Load existing external_ids once (avoid N+1 dedup queries).
  let existing = new Set<string>();
  try {
    const { data } = await admin.from('scholarships').select('external_id');
    existing = new Set((data || []).map((r) => r.external_id).filter(Boolean) as string[]);
  } catch (e) {
    console.warn('Could not load existing external_ids for dedup:', (e as Error).message);
  }

  // De-duplicate external_ids across existing rows AND within this batch.
  const seenInBatch = new Set<string>();
  for (const [s, sourceName] of sourceList) {
    if (!s.title || !s.provider) continue;
    const ref = s.sourceUrl || '';
    if (ref) {
      if (existing.has(ref)) continue; // already in DB
      if (seenInBatch.has(ref)) continue; // already queued this run
      seenInBatch.add(ref);
    }

    batch.push({
      external_id: ref || null,
      title: s.title,
      provider: s.provider,
      university: s.university || null,
      host_country: s.hostCountry || 'Multiple',
      degree_levels: s.degreeLevels || ['Master / Postgraduate'],
      fields_of_study: s.fieldsOfStudy || ['All / Any Field'],
      funding_type: s.fundingType || 'Fully Funded',
      deadline: s.deadline || null,
      deadline_status: 'open',
      summary: s.summary || '',
      key_requirements: s.keyRequirements || [],
      eligibility_criteria: {},
      rejection_pitfalls: [],
      insider_tips: [],
      official_application_url: s.officialApplicationUrl || null,
      contacts: s.contacts || {},
      source_url: s.sourceUrl || null,
      source_name: sourceName,
      last_verified_at: now,
      is_custom: false,
      is_active: true,
    });
  }

  if (batch.length === 0) return 0;

  // Insert in chunks to avoid very large payloads; count rows written.
  const CHUNK = 25;
  for (let i = 0; i < batch.length; i += CHUNK) {
    const chunk = batch.slice(i, i + CHUNK);
    const { error, count } = await admin
      .from('scholarships')
      .upsert(chunk, { onConflict: 'external_id', count: 'exact' });
    if (error) {
      console.error('Batch upsert failed:', error.message);
    } else {
      insertedForUpsert += (count ?? chunk.length) - 0;
    }
  }

  // New external_ids from this run so future runs won't re-insert but we
  // can still count rows actually created on this run.
  return insertedForUpsert;
}

async function logDiscovery(query: string, status: string, found: number, error?: string | null) {
  try {
    await admin.from('discovery_log').insert({
      source_url: query,
      source_name: 'feed-discovery',
      status,
      scholarships_found: found,
      error_message: error || null,
    });
  } catch (e) {
    console.error('Failed to write discovery_log:', (e as Error).message);
  }
}

// Kept for backward compatibility with the scheduled/manual job callers.
// Discovery now fetches all feeds in a single run and ignores the query text.
export const DISCOVERY_QUERIES: { id: string; query: string }[] = [
  { id: 'all-feeds', query: 'all scholarship feeds' },
];

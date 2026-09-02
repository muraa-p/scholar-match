import { GoogleGenAI, Type } from '@google/genai';
import { getGeminiClient, fetchJson, GEMINI_MODEL } from '../server/gemini';
import { admin } from '../lib/supabaseAdmin';

// ---------------------------------------------------------------------
// Discovery sources: curated topical queries that return many fresh
// scholarship opportunities. We use Gemini's web grounding instead of
// brittle HTML scraping so results stay robust on flaky networks.
// ---------------------------------------------------------------------

export interface DiscoveryQuery {
  id: string;
  query: string;
}

export const DISCOVERY_QUERIES: DiscoveryQuery[] = [
  { id: 'fully-funded-masters', query: 'List current fully funded master scholarships for international students 2026 2027 with application deadlines' },
  { id: 'phd-scholarships', query: 'List current fully funded PhD scholarships for international students 2026 2027 with deadlines' },
  { id: 'developing-countries', query: 'List scholarships for students from developing countries 2026 2027 with application links' },
  { id: 'stem', query: 'List STEM scholarships for international students 2026 2027 with requirements and deadlines' },
  { id: 'undergraduate', query: 'List undergraduate scholarships for international students 2026 2027 with deadlines' },
];

// ---------------------------------------------------------------------
// Structured extraction from a chunk of discovered web text
// ---------------------------------------------------------------------

interface ExtractedScholarship {
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

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    provider: { type: Type.STRING },
    university: { type: Type.STRING },
    hostCountry: { type: Type.STRING },
    degreeLevels: { type: Type.ARRAY, items: { type: Type.STRING } },
    fieldsOfStudy: { type: Type.ARRAY, items: { type: Type.STRING } },
    fundingType: { type: Type.STRING },
    deadline: { type: Type.STRING },
    summary: { type: Type.STRING },
    keyRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
    officialApplicationUrl: { type: Type.STRING },
    contacts: {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING },
        inquiryFormUrl: { type: Type.STRING },
      },
    },
    sourceUrl: { type: Type.STRING },
    sourceName: { type: Type.STRING },
  },
  required: ['title', 'provider', 'hostCountry', 'degreeLevels', 'fundingType'],
};

export async function runDiscoveryRun(query: string): Promise<{ results: number; errors: number }> {
  const ai = getGeminiClient();
  if (!ai) {
    console.warn('No Gemini key — skipping discovery run');
    return { results: 0, errors: 0 };
  }

  try {
    const raw = await fetchJson<{ scholarships: ExtractedScholarship[] }>(
      ai,
      `You are a scholarship discovery agent with live web access. Search the web for current, REAL scholarship opportunities matching this intent: "${query}".

For each scholarship you find, extract accurate, up-to-date information. Only include scholarships that actually exist and are currently open for application (or have an announced 2026/2027 deadline).

Return a JSON object:
{
  "scholarships": [
    {
      "title": "Official scholarship name",
      "provider": "Funding organization",
      "university": "Host university if a single institution (else null)",
      "hostCountry": "Host country",
      "degreeLevels": ["Bachelor / Undergraduate" | "Master / Postgraduate" | "PhD / Doctorate" | ...],
      "fieldsOfStudy": ["All / Any Field" or specific fields],
      "fundingType": "Fully Funded" | "Partial Tuition" | "Tuition Only" | "Stipend Only" | "Research Grant",
      "deadline": "YYYY-MM-DD or descriptive text",
      "summary": "1-2 sentence description",
      "keyRequirements": ["requirement 1", "requirement 2", ...],
      "officialApplicationUrl": "https://...",
      "contacts": { "email": "...", "inquiryFormUrl": "..." },
      "sourceUrl": "the webpage you found this on",
      "sourceName": "e.g. the website domain"
    }
  ]
}

Try to return 5-10 scholarships. Prefer well-known, verifiable programs.`,
      SCHEMA,
      40000
    );

    if (!raw?.scholarships || raw.scholarships.length === 0) {
      console.log('No scholarships extracted for query:', query);
      return { results: 0, errors: 0 };
    }

    let inserted = 0;
    let errors = 0;
    for (const s of raw.scholarships) {
      const ok = await persistScholarship(s, query);
      if (ok) inserted++;
      else errors++;
    }
    return { results: inserted, errors };
  } catch (e) {
    console.error('Discovery run error for query:', query, (e as Error).message);
    return { results: 0, errors: 1 };
  }
}

// Deduplicate + store a discovered scholarship
async function persistScholarship(s: ExtractedScholarship, query: string): Promise<boolean> {
  if (!s.title || !s.provider || !s.hostCountry || !s.fundingType) return false;

  // Deduplicate by normalized title + provider
  const normalizedTitle = s.title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const existing = await admin
    .from('scholarships')
    .select('id')
    .or(`external_id.eq.${s.sourceUrl || ''}`)
    .ilike('title', `%${s.title.trim().slice(0, 40)}%`)
    .limit(1);

  // Simple title-based dedup check
  if (existing?.data && existing.data.length > 0) {
    return false; // duplicate
  }

  const { error } = await admin.from('scholarships').upsert(
    {
      title: s.title,
      provider: s.provider,
      university: s.university || null,
      host_country: s.hostCountry,
      degree_levels: s.degreeLevels || [],
      fields_of_study: s.fieldsOfStudy || ['All / Any Field'],
      funding_type: s.fundingType,
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
      source_name: query,
      last_verified_at: new Date().toISOString(),
      is_custom: false,
      is_active: true,
    },
    { onConflict: 'external_id' }
  );
  if (error) {
    console.error('Failed to persist scholarship:', s.title, error.message);
    return false;
  }
  return true;
}

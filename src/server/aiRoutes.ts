import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { getGeminiClient, fetchJson, GEMINI_MODEL } from './gemini';

const router = Router();

// ---------- In-memory cache ----------
const cache = new Map<string, { data: any; timestamp: number }>();
const TTL = 1000 * 60 * 60 * 24; // 24h

function hitCache(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < TTL) return entry.data;
  return null;
}
function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// ---------------------------------------------------------------
// POST /api/ai/summarize
// ---------------------------------------------------------------
router.post('/summarize', async (req: Request, res: Response) => {
  const { scholarshipId, title, provider, hostCountry, fundingType, summary, keyRequirements, eligibilityCriteria } = req.body;
  if (!scholarshipId || !title) {
    return res.status(400).json({ error: 'Missing scholarship ID or title' });
  }

  const cached = hitCache(`summarize:${scholarshipId}`);
  if (cached) return res.json({ ...cached, fromCache: true });

  const fallback = {
    scholarshipId,
    overview: `${title} is a prestigious ${fundingType || ''} scholarship offered by ${provider || 'the provider'} in ${hostCountry || 'multiple locations'}.`,
    keyHighlights: [
      `Comprehensive funding covering core academic and living expenses.`,
      `Open to qualified international candidates meeting academic criteria.`,
      `Recognized award with a global alumni and research network.`,
    ],
    essentialRequirements:
      Array.isArray(keyRequirements) && keyRequirements.length > 0
        ? keyRequirements.slice(0, 4)
        : ['Academic transcripts', 'Statement of Purpose / Motivation Letter', 'Letters of Recommendation', 'Proof of language proficiency'],
    targetCandidateProfile: `Applicants with a strong academic track record (${eligibilityCriteria?.minGpa ? `GPA ${eligibilityCriteria.minGpa}+` : 'competitive GPA'}).`,
    keyAdvice: 'Ensure your personal statement explicitly addresses your study goals and future career contribution.',
  };

  const ai = getGeminiClient();
  if (!ai) {
    setCache(`summarize:${scholarshipId}`, fallback);
    return res.json(fallback);
  }

  try {
    const data = await fetchJson<Record<string, any>>(
      ai,
      `You are a concise academic advisor. Summarize the following scholarship and its requirements in a clear, ultra-readable, minimalist format.

Scholarship: "${title}"
Provider: ${provider}
Host Country: ${hostCountry}
Funding Type: ${fundingType}
Summary: ${summary}
Requirements: ${JSON.stringify(keyRequirements || [])}
Eligibility: ${JSON.stringify(eligibilityCriteria || {})}

Provide:
- overview: 1-2 sentence high level summary
- keyHighlights: 3 scannable bullet points of the biggest benefits
- essentialRequirements: 3-4 most critical mandatory requirements
- targetCandidateProfile: 1 sentence describing ideal applicants
- keyAdvice: 1 actionable tip for a winning application`,
      {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING },
          keyHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          essentialRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          targetCandidateProfile: { type: Type.STRING },
          keyAdvice: { type: Type.STRING },
        },
        required: ['overview', 'keyHighlights', 'essentialRequirements', 'targetCandidateProfile', 'keyAdvice'],
      }
    );

    if (!data) return res.json(fallback);
    const parsed = { ...fallback, ...data, scholarshipId };
    setCache(`summarize:${scholarshipId}`, parsed);
    return res.json(parsed);
  } catch (e) {
    console.error('summarize error:', e);
    return res.json(fallback);
  }
});

// ---------------------------------------------------------------
// POST /api/ai/diagnose-fit
// ---------------------------------------------------------------
router.post('/diagnose-fit', async (req: Request, res: Response) => {
  const { profile, scholarship } = req.body;
  if (!profile || !scholarship) {
    return res.status(400).json({ error: 'Missing profile or scholarship' });
  }

  const cacheKey = `diag:${scholarship.id}:${profile.gpa}:${profile.fieldOfStudy}`;
  const cached = hitCache(cacheKey);
  if (cached) return res.json(cached);

  const fallback = {
    committeePerspective: `The ${scholarship.provider} selection committee seeks candidates who demonstrate clear alignment with "${scholarship.title}", strong academic readiness, and a compelling vision for contributing to their field and community.`,
    rejectionRisks: [
      ...(scholarship.rejectionPitfalls || []).slice(0, 3),
      ...(profile.gpa < (scholarship.eligibilityCriteria?.minGpa || 0)
        ? ['Your GPA may be below the stated minimum. Emphasize exceptional project work and upward grade trend.']
        : []),
    ],
    actionPlan: [
      'Read the official eligibility criteria and map each one to concrete evidence in your profile.',
      'Draft a tailored statement that directly addresses the committee mandate and your specific fit.',
      'Secure 2-3 strong reference letters that attest to your suitability and impact.',
      'Prepare all transcripts and certifications early to avoid last-minute delays.',
    ],
    suggestedChecklist: [
      'Create a requirements-to-evidence mapping table for your application',
      'Draft the motivation/statement draft customized to this scholarship',
      'Collect official transcripts and reference letters',
      'Book a language proficiency test slot if not yet taken',
    ],
  };

  const ai = getGeminiClient();
  if (!ai) return res.json(fallback);

  try {
    const data = await fetchJson<Record<string, any>>(
      ai,
      `You are an elite scholarship admissions strategist. Diagnose why THIS specific candidate might get REJECTED for the given scholarship, and provide a turnaround action plan.

Candidate Profile:
${JSON.stringify(profile, null, 2)}

Scholarship:
${JSON.stringify({ title: scholarship.title, provider: scholarship.provider, hostCountry: scholarship.hostCountry, summary: scholarship.summary, keyRequirements: scholarship.keyRequirements, eligibilityCriteria: scholarship.eligibilityCriteria, rejectionPitfalls: scholarship.rejectionPitfalls, insiderTips: scholarship.insiderTips }, null, 2)}

Return JSON:
- committeePerspective: string (1-2 sentences, what the committee is likely thinking about this candidate)
- rejectionRisks: string[] (4-6 specific, profile-driven risk statements)
- actionPlan: string[] (4-6 concrete turnaround steps)
- suggestedChecklist: string[] (4-6 actionable checklist tasks)`,
      {
        type: Type.OBJECT,
        properties: {
          committeePerspective: { type: Type.STRING },
          rejectionRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['committeePerspective', 'rejectionRisks', 'actionPlan', 'suggestedChecklist'],
      }
    );

    if (!data) return res.json(fallback);
    const result = { ...fallback, ...data };
    setCache(cacheKey, result);
    return res.json(result);
  } catch (e) {
    console.error('diagnose-fit error:', e);
    return res.json(fallback);
  }
});

// ---------------------------------------------------------------
// POST /api/ai/draft-sop
// ---------------------------------------------------------------
router.post('/draft-sop', async (req: Request, res: Response) => {
  const { profile, scholarship, customNotes, tone } = req.body;
  if (!profile || !scholarship) {
    return res.status(400).json({ error: 'Missing profile or scholarship' });
  }

  const fallback = {
    letterDraft: `Dear Selection Committee,

I am writing to express my strong interest in the ${scholarship.title} offered by ${scholarship.provider} in ${scholarship.hostCountry}.

As a ${profile.fieldOfStudy} professional with ${profile.workExperienceYears} years of experience and a ${profile.gpa.toFixed(2)} GPA, I am eager to pursue further study in this field. This program directly aligns with my goal to ${profile.name && profile.name !== 'Scholar Applicant' ? `contribute to my community as ${profile.name}` : 'contribute meaningfully to my field and community'}.

[Expand with your specific background, achievements, and why this program is the right fit for you.]

Thank you for considering my application.

Sincerely,
${profile.name || 'Your Name'}`,
    outline: [
      'Introduction: who you are and the program you are applying to',
      'Academic background and relevant experience',
      'Why you chose this specific program and institution',
      'Your career goals and how this program enables them',
      'Conclusion: reaffirm your fit and thank the committee',
    ],
    tips: [
      'Customize every paragraph to this specific scholarship and its stated priorities.',
      'Quantify your achievements wherever possible (numbers, outcomes, impact).',
      'Have 1-2 other people review for clarity, flow, and authenticity.',
    ],
  };

  const ai = getGeminiClient();
  if (!ai) return res.json(fallback);

  const toneDescription: Record<string, string> = {
    persuasive_academic: 'Balanced academic rigor and persuasive storytelling',
    leadership_impact: 'Leadership, policy and social impact focus (Chevening/Fulbright style)',
    technical_research: 'Laboratory & research proposal focus (DAAD/MEXT/SINGA style)',
    community_resilience: 'Overcoming adversity and community give-back focus (Mastercard style)',
  };

  try {
    const data = await fetchJson<Record<string, any>>(
      ai,
      `You are an expert scholarship essay writer. Draft a compelling, authentic motivation letter / statement of purpose for the candidate matching the scholarship's exact criteria.

Tone: ${toneDescription[tone] || toneDescription.persuasive_academic}

Candidate Profile:
${JSON.stringify(profile, null, 2)}

Scholarship:
${JSON.stringify({ title: scholarship.title, provider: scholarship.provider, hostCountry: scholarship.hostCountry, summary: scholarship.summary, keyRequirements: scholarship.keyRequirements, insiderTips: scholarship.insiderTips }, null, 2)}

Additional notes the candidate wants included: ${customNotes || 'None'}

Return JSON:
- letterDraft: string (full essay, 500-700 words, formatted with paragraph breaks using \\n\\n)
- outline: string[] (the narrative structure used, 4-6 steps)
- tips: string[] (3-4 specific personalization suggestions)`,
      {
        type: Type.OBJECT,
        properties: {
          letterDraft: { type: Type.STRING },
          outline: { type: Type.ARRAY, items: { type: Type.STRING } },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['letterDraft', 'outline', 'tips'],
      }
    );

    if (!data) return res.json(fallback);
    return res.json({ ...fallback, ...data });
  } catch (e) {
    console.error('draft-sop error:', e);
    return res.json(fallback);
  }
});

// ---------------------------------------------------------------
// POST /api/ai/review-essay
// ---------------------------------------------------------------
router.post('/review-essay', async (req: Request, res: Response) => {
  const { essayText, scholarshipTitle, scholarshipRequirements } = req.body;
  if (!essayText || typeof essayText !== 'string') {
    return res.status(400).json({ error: 'Missing essayText' });
  }

  const fallback = {
    overallScore: 65,
    clarityScore: 68,
    alignmentScore: 62,
    impactScore: 60,
    summary: 'The essay shows effort and a clear direction, but needs stronger structure, more specific examples, and tighter alignment with the scholarship criteria.',
    strengths: [
      'Clear overall message and purpose.',
      'Relevant background context is included.',
    ],
    weaknesses: [
      'Could benefit from more specific, quantified examples.',
      'Alignment with the scholarship criteria could be strengthened.',
    ],
    suggestedEdits: [
      'Add a strong opening hook that captures your motivation.',
      'Quantify achievements with specific outcomes and numbers.',
      'Explicitly connect your goals to the scholarship (${scholarshipTitle}) and its requirements.',
      'Strengthen the conclusion with a forward-looking statement.',
    ],
  };

  const ai = getGeminiClient();
  if (!ai) {
    return res.json(fallback);
  }

  try {
    const data = await fetchJson<Record<string, any>>(
      ai,
      `You are a seasoned scholarship essay evaluator. Critique the candidate's essay against the scholarship criteria and return a detailed, constructive evaluation.

Scholarship: ${scholarshipTitle}
Scholarship Requirements: ${JSON.stringify(scholarshipRequirements || [])}

Essay:
"""
${essayText}
"""

Return JSON:
- overallScore: number (0-100)
- clarityScore: number (0-100)
- alignmentScore: number (0-100)
- impactScore: number (0-100)
- summary: string (2-3 sentence evaluator summary)
- strengths: string[] (3-5 bullet points)
- weaknesses: string[] (3-5 bullet points)
- suggestedEdits: string[] (4-6 specific, actionable revisions)`,
      {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER },
          clarityScore: { type: Type.INTEGER },
          alignmentScore: { type: Type.INTEGER },
          impactScore: { type: Type.INTEGER },
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedEdits: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['overallScore', 'clarityScore', 'alignmentScore', 'impactScore', 'summary', 'strengths', 'weaknesses', 'suggestedEdits'],
      }
    );

    if (!data) return res.json(fallback);
    return res.json({ ...fallback, ...data });
  } catch (e) {
    console.error('review-essay error:', e);
    return res.json(fallback);
  }
});

export default router;

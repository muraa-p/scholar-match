import { GoogleGenAI, Type } from '@google/genai';

// Lazy Gemini client init. Returns null if no key set.
let cachedClient: GoogleGenAI | null | undefined;
export function getGeminiClient(): GoogleGenAI | null {
  if (cachedClient !== undefined) return cachedClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    cachedClient = null;
    return null;
  }
  cachedClient = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
  return cachedClient;
}

export const GEMINI_MODEL = 'gemini-3.7-flash';

// Enforce a hard wall-clock timeout so slow/flaky networks fail fast
// and callers can fall back to deterministic templates instead of hanging.
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer as unknown as NodeJS.Timeout);
  }
}

export async function callGeminiText(prompt: string, timeoutMs = 20000): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;
  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      }),
      timeoutMs
    );
    return response.text || null;
  } catch (e) {
    console.error('Gemini generateContent error:', (e as Error).message);
    return null;
  }
}

// Robust JSON extraction from Gemini responses (with timeout + graceful null)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchJson<T>(
  ai: GoogleGenAI,
  prompt: string,
  schema: any,
  timeoutMs = 25000,
  retries = 3
): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        }),
        timeoutMs
      );
      if (!response.text) return null;
      const text = response.text.trim();
      // Handle potential markdown code fences
      const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (e) {
      const msg = (e as Error).message || '';
      // Retry only on transient quota/availability errors, with backoff.
      if (attempt < retries && /429|503|quota|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand/.test(msg)) {
        const wait = 2000 * Math.pow(2, attempt);
        console.warn(`Gemini fetchJson retry ${attempt + 1}/${retries} after ${wait}ms: ${msg.slice(0, 120)}`);
        await sleep(wait);
        continue;
      }
      console.error('Gemini fetchJson error:', msg);
      return null;
    }
  }
  return null;
}

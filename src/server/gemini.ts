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
export async function fetchJson<T>(
  ai: GoogleGenAI,
  prompt: string,
  schema: any,
  timeoutMs = 25000,
  options?: { tools?: any[] }
): Promise<T | null> {
  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          ...(options?.tools?.length ? { tools: options.tools } : {}),
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
    console.error('Gemini fetchJson error:', (e as Error).message);
    return null;
  }
}

// Google Search grounding tool definition (lets Gemini search the live web).
export const GOOGLE_SEARCH_TOOL = { googleSearch: {} };

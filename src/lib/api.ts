import { supabase } from './supabase';

// Thin wrapper around fetch that attaches the user's Supabase access token so
// protected serverless routes (/api/ai/*) can authenticate the caller.
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  return fetch(url, { ...options, headers });
}

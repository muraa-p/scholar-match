import { createClient } from '@supabase/supabase-js';
import { createDemoClient } from './demoSupabase';

// Frontend client (public anon key safe to ship to browser)
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

/**
 * Force the offline client even when credentials are present. Useful for public
 * demo deployments where the configured project may be paused, asleep, or rate
 * limited: set VITE_DEMO_MODE=true and the seeded local experience is used.
 */
const forceDemo = (import.meta.env.VITE_DEMO_MODE as string) === 'true';

/**
 * True when a real Supabase project is wired up and demo mode is not forced.
 * When false the app runs against a localStorage-backed client with the same
 * interface, so no other file needs to change. See .env.example to connect a
 * real database.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey) && !forceDemo;

/**
 * Note: createClient('', '') throws at import time, which takes the whole app
 * down. Never construct it without credentials.
 */
export const supabase: any = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createDemoClient();

import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { startDemoSession } from '../lib/demoSupabase';
import { Award, Mail, Lock, Loader2, Sparkles, Github } from 'lucide-react';

const isDemoMode = !isSupabaseConfigured;

export const AuthPage: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error);
        else onDone();
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error);
        } else {
          setSuccess('Account created! Check your email to confirm your account, then sign in.');
          setMode('login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setError(null);
    setLoading(true);
    startDemoSession();
    // The auth listener picks this up, but calling onDone keeps it instant.
    onDone();
  };

  // /?demo=1 jumps straight into the demo — handy for sharing a link.
  useEffect(() => {
    if (!isDemoMode) return;
    if (new URLSearchParams(window.location.search).get('demo') !== '1') return;
    startDemoSession();
    onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#0A0A0B] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-900 dark:bg-[#C5A267] text-white dark:text-[#0A0A0B] mb-4 shadow-lg">
            <Award className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-stone-900 dark:text-[#F4F4F5]">ScholarMatch</h1>
          <p className="text-sm text-stone-500 dark:text-[#8E8E93] mt-1">
            Global Scholarship Discovery & Opportunity Portal
          </p>
        </div>

        <div className="bg-white dark:bg-[#121217] rounded-2xl border border-stone-200 dark:border-[#24242E] p-6 shadow-sm">
          {/* Mode toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex rounded-xl bg-stone-100 dark:bg-[#181820] p-1">
              <button
                onClick={() => setMode('login')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === 'login'
                    ? 'bg-white dark:bg-[#2A2A34] text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 dark:text-[#8E8E93]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-[#2A2A34] text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 dark:text-[#8E8E93]'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1.5">
                  Full Name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-none focus:ring-1 focus:ring-[#C5A267]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-none focus:ring-1 focus:ring-[#C5A267]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-[#D1D1D6] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] focus:outline-none focus:ring-1 focus:ring-[#C5A267]"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-stone-900 dark:bg-[#C5A267] text-white dark:text-[#0A0A0B] hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-stone-200 dark:bg-[#24242E]" />
            <span className="text-[11px] text-stone-400 dark:text-[#71717A] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-stone-200 dark:bg-[#24242E]" />
          </div>

          {isDemoMode && (
            <button
              type="button"
              onClick={handleDemo}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#C5A267] text-[#0A0A0B] hover:opacity-90 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Explore the demo — no account needed
            </button>
          )}

          <p className="text-[11px] text-stone-400 dark:text-[#71717A] mt-3 text-center leading-relaxed">
            {isDemoMode
              ? 'This deployment runs offline with sample data. No database, no sign-up.'
              : 'Or continue with your account.'}
          </p>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-stone-300 dark:border-[#2E2E3C] text-stone-700 dark:text-[#E4E4E7] hover:bg-stone-50 dark:hover:bg-[#181820] transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-xs text-stone-400 dark:text-[#71717A] mt-6">
          Your scholarships, applications & checklists are saved securely to your account.
        </p>
      </div>
    </div>
  );
};

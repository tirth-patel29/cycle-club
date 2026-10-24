'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please verify admin credentials.');
        return;
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('acc_auth_changed'));
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemoAdmin() {
    setEmail('tirthhpatel29@gmail.com');
    setPassword('tirth#2957');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-lime-500/10 text-lime-600 dark:text-lime-400 flex items-center justify-center mx-auto mb-3 border border-lime-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-lime-600 dark:text-lime-400 font-bold">
            RESTRICTED ACCESS
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mt-1">
            Club Admin Portal
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Operations control, timing data, stage management, and rider exports
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tirthhpatel29@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-lime-500 text-black font-black text-xs uppercase tracking-wider hover:bg-lime-400 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Verifying Credentials...
              </>
            ) : (
              <>
                <span>Enter Operations Radar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Admin Quick Access */}
        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-white/10 text-center">
          <p className="text-[11px] text-zinc-500 mb-2 font-mono">
            Development / Organizer Quick-fill:
          </p>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:border-lime-500 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-lime-500" />
            Fill Admin Credentials
          </button>
        </div>
      </div>
    </div>
  );
}

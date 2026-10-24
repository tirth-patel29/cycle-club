'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bike, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { CLUB_NAME } from '@/lib/constants';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/profile';
  const prefillEmail = searchParams.get('email') || '';
  const justRegistered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState(prefillEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      // Smooth redirection to intended destination with session loaded
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('acc_auth_changed'));
      }
      router.push(returnUrl);
      router.refresh();
    } catch {
      setErrorMessage('Network connection error. Please try again.');
      setLoading(false);
    }
  };

  // Quick Demo Login
  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('AnandRider2026!');
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoEmail,
          password: 'AnandRider2026!'
        })
      });

      if (response.ok) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('acc_auth_changed'));
        }
        router.push(returnUrl);
        router.refresh();
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-24 sm:py-32 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-lime-500/10 text-lime-600 dark:text-[#b8f04c] flex items-center justify-center mx-auto mb-4 border border-lime-500/20 shadow-sm">
          <Bike className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          Rider Sign In
        </h1>
        <p className="text-xs text-slate-600 dark:text-white/60 uppercase tracking-widest font-mono">
          {CLUB_NAME} • OFFICIAL PARTICIPANT PORTAL
        </p>
      </div>

      {justRegistered && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Account created successfully! Enter your password below to sign in.</span>
        </div>
      )}

      {/* Login Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/10 shadow-2xl space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-white/70 block">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rider@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-sm focus:border-lime-500 outline-hidden transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-white/70">
                Password *
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] text-slate-500 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-sm focus:border-lime-500 outline-hidden transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glossy-lime w-full py-4 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider shadow-lg disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[3]" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>SIGN IN & CONTINUE</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fills */}
        <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-white/40 block font-bold">
            QUICK DEMO ACCOUNTS:
          </span>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleQuickDemo('rajesh.patel@example.in')}
              className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-lime-500 text-slate-700 dark:text-white/80 transition-colors cursor-pointer"
            >
              Rajesh (Hybrid)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ananya.sharma@example.in')}
              className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-lime-500 text-slate-700 dark:text-white/80 transition-colors cursor-pointer"
            >
              Ananya (Road)
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-xs">
          <span className="text-slate-600 dark:text-white/60">New to Anand Cycling Club? </span>
          <Link
            href={`/auth/signup?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="text-[#2e4a06] dark:text-[#b8f04c] font-black uppercase hover:underline"
          >
            Create Rider Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bike, ArrowRight, AlertCircle, Loader2, CheckCircle2, ShieldCheck, Ticket } from 'lucide-react';
import { CLUB_NAME } from '@/lib/constants';
import { BicycleType } from '@/types';
import { BICYCLE_TYPES } from '@/lib/validations/registration';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/profile';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bicycleType, setBicycleType] = useState<BicycleType>('Road');
  const [bicycleBrand, setBicycleBrand] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirmation Pop-up Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          mobile_number: mobileNumber.trim(),
          bicycle_type: bicycleType,
          bicycle_brand: bicycleBrand.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to create rider account');
        setLoading(false);
        return;
      }

      setRegisteredName(fullName.trim());
      setRegisteredEmail(email.trim());
      setShowSuccessModal(true);
    } catch {
      setErrorMessage('Network error occurred during account creation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-20 sm:py-28 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-lime-500/10 text-lime-600 dark:text-[#b8f04c] flex items-center justify-center mx-auto mb-4 border border-lime-500/20 shadow-sm">
          <Bike className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          Join the Collective
        </h1>
        <p className="text-xs text-slate-600 dark:text-white/60 uppercase tracking-widest font-mono">
          {CLUB_NAME} • RIDER ONBOARDING
        </p>
      </div>

      {/* Signup Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/10 shadow-2xl relative">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-white/70 block">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Neil Patel"
              className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-sm focus:border-lime-500 outline-hidden transition-colors"
            />
          </div>

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
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-white/70 block">
              Mobile Number (+91) *
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="98250 12345"
              className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-sm font-bold focus:border-lime-500 outline-hidden transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-white/70 block">
              Password (min 6 characters) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-sm focus:border-lime-500 outline-hidden transition-colors"
            />
          </div>

          {/* Primary Bicycle Type Selection */}
          <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-white/70 block">
              Primary Bicycle Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BICYCLE_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setBicycleType(type)}
                  className={`p-2.5 rounded-xl text-center border font-mono text-xs font-bold transition-all ${
                    bicycleType === type
                      ? 'bg-lime-500 text-black border-lime-600 shadow-sm'
                      : 'bg-white dark:bg-black/30 border-slate-300 dark:border-white/15 text-slate-800 dark:text-zinc-200 hover:border-lime-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-white/70 block">
              Bicycle Brand (Optional)
            </label>
            <input
              type="text"
              value={bicycleBrand}
              onChange={(e) => setBicycleBrand(e.target.value)}
              placeholder="e.g. Trek, Giant, Scott, Firefox"
              className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-sm focus:border-lime-500 outline-hidden transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glossy-lime w-full py-4 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider shadow-lg disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[3]" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <span>COMPLETE REGISTRATION</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10 text-center text-xs">
          <span className="text-slate-600 dark:text-white/60">Already registered? </span>
          <Link
            href={`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="text-[#2e4a06] dark:text-[#b8f04c] font-black uppercase hover:underline"
          >
            Sign In Here
          </Link>
        </div>
      </div>

      {/* CONFIRMATION POP-UP MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-inner">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                REGISTRATION CONFIRMED
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Welcome, {registeredName}!
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
                Your rider profile has been created with <strong>{bicycleType}</strong> as your primary steed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-xs text-left font-mono space-y-1">
              <p className="text-zinc-500">Rider ID: <span className="text-zinc-900 dark:text-white font-bold">{registeredEmail}</span></p>
              <p className="text-zinc-500">Club: <span className="text-zinc-900 dark:text-white font-bold">Anand Cycling Club</span></p>
              <p className="text-zinc-500">Bicycle: <span className="text-lime-600 dark:text-lime-400 font-bold">{bicycleType}</span></p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  router.push(returnUrl);
                  router.refresh();
                }}
                className="btn-glossy-lime w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>ENTER RIDER DASHBOARD</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push(`/auth/login?email=${encodeURIComponent(registeredEmail)}&registered=true`);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Go to Sign In Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Bike, ArrowRight, AlertCircle, Loader2, Check } from 'lucide-react';
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
  const [bicycleType, setBicycleType] = useState<BicycleType>('Hybrid');
  const [bicycleBrand, setBicycleBrand] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            mobile_number: mobileNumber.trim(),
            bicycle_type: bicycleType,
            bicycle_brand: bicycleBrand.trim()
          }
        }
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      // Also call our profile endpoint to save initial profile
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user?.id || `usr-${Date.now()}`,
          full_name: fullName.trim(),
          email: email.trim(),
          mobile_number: mobileNumber.trim(),
          bicycle_type: bicycleType,
          bicycle_brand: bicycleBrand.trim()
        })
      });

      router.push(returnUrl);
      router.refresh();
    } catch {
      router.push(returnUrl);
      router.refresh();
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-24 sm:py-32 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[#b8f04c] text-[#0c1204] flex items-center justify-center font-bold mx-auto shadow-[0_0_20px_rgba(184,240,76,0.35)]">
          <Bike className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
          JOIN THE RIDE
        </h1>
        <p className="text-xs uppercase text-slate-600 dark:text-white/60 font-medium tracking-wider">
          Create your {CLUB_NAME} Rider Profile
        </p>
      </div>

      {/* Card */}
      <div className="glass-panel rounded-3xl border border-black/10 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-white/70 uppercase block">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rajesh Patel"
              className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-base focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-white/70 uppercase block">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@example.in"
                className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-base focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-white/70 uppercase block">WhatsApp Mobile (+91) *</label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="98250 12345"
                className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-base font-bold focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-white/70 uppercase block">Password (Min 6 Characters) *</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-base focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden transition-colors"
            />
          </div>

          {/* Canonical Bicycle Type Selection (Exactly: Road, Hybrid, MTB, City Bike, Gravel Cycle) */}
          <div className="space-y-2 pt-1">
            <label className="text-slate-700 dark:text-white/70 uppercase block">
              Primary Bicycle Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle'] as BicycleType[]).map((type) => {
                const isSelected = bicycleType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBicycleType(type)}
                    className={`py-3 px-3 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2e4a06] bg-[#2e4a06]/10 text-[#2e4a06] dark:border-[#b8f04c] dark:bg-[#b8f04c]/10 dark:text-[#b8f04c] shadow-xs'
                        : 'border-slate-300 dark:border-white/10 bg-white dark:bg-black/40 text-slate-700 dark:text-white/70 hover:border-slate-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-white/70 uppercase block">Bicycle Brand & Model (Optional)</label>
            <input
              type="text"
              value={bicycleBrand}
              onChange={(e) => setBicycleBrand(e.target.value)}
              placeholder="e.g. Trek FX 2 or Firefox Target"
              className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-sm focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glossy-lime w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <span>CREATE PROFILE & CONTINUE</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-black/10 dark:border-white/10 text-center text-xs text-slate-600 dark:text-white/60">
          <span>Already have a rider account? </span>
          <Link
            href={`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="text-[#2e4a06] dark:text-[#b8f04c] font-bold hover:underline"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RiderSignupPage() {
  return (
    <Suspense fallback={<div className="text-center py-32 font-bold">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}

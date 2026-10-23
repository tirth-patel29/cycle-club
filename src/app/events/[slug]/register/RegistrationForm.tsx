'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CyclingEvent } from '@/types';
import { formatINR } from '@/lib/constants';
import { normalizeIndianMobile, INDIAN_MOBILE_REGEX } from '@/lib/validations/registration';
import { AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  event: CyclingEvent;
}

export function RegistrationForm({ event }: Props) {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [bicycleType, setBicycleType] = useState<'Road Bike' | 'Hybrid' | 'MTB' | 'Single Speed' | 'Other'>('Hybrid');
  const [jerseySize, setJerseySize] = useState<'S' | 'M' | 'L' | 'XL' | '2XL' | 'None'>('None');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const key = crypto.randomUUID ? crypto.randomUUID() : '550e8400-e29b-41d4-a716-' + Date.now();
    setIdempotencyKey(key);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanedMobile = normalizeIndianMobile(mobileNumber);
    if (!INDIAN_MOBILE_REGEX.test(cleanedMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (age === '' || Number(age) < 12 || Number(age) > 100) {
      setErrorMessage('Please enter a valid age between 12 and 100.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('You must accept the safety helmet rule to proceed.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKey
        },
        body: JSON.stringify({
          event_id: event.id,
          full_name: fullName.trim(),
          mobile_number: cleanedMobile,
          email: email.trim() || undefined,
          age: Number(age),
          gender,
          bicycle_type: bicycleType,
          jersey_size: jerseySize,
          terms_accepted: true,
          idempotency_key: idempotencyKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      router.push(`/registrations/${data.public_reference}/pay`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Rider Information */}
      <div className="glass-panel rounded-2xl border border-black/10 dark:border-white/10 p-5 sm:p-8 space-y-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#335306] dark:text-[#b8f04c]">
          1. Rider Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-slate-700 dark:text-white/70 uppercase">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rajesh Patel"
              className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-base focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-white/70 uppercase">WhatsApp Mobile (+91) *</label>
            <input
              type="tel"
              required
              maxLength={14}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="98250 12345"
              className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-base font-bold focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-white/70 uppercase">Email (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-base focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-white/70 uppercase">Age (Years) *</label>
            <input
              type="number"
              required
              min={12}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 45"
              className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-base font-bold focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-white/70 uppercase">Gender *</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-sm focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden transition-colors"
            >
              <option value="Male" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Male</option>
              <option value="Female" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Female</option>
              <option value="Other" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Other</option>
              <option value="Prefer not to say" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Bicycle & T-Shirt */}
      <div className="glass-panel rounded-2xl border border-black/10 dark:border-white/10 p-5 sm:p-8 space-y-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#335306] dark:text-[#b8f04c]">
          2. Bicycle & T-Shirt Size
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-white/70 uppercase">Bicycle Category</label>
            <select
              value={bicycleType}
              onChange={(e) => setBicycleType(e.target.value as any)}
              className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-sm focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden"
            >
              <option value="Hybrid" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Hybrid (Most Common)</option>
              <option value="Road Bike" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Road / Drop-bar Bike</option>
              <option value="MTB" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Mountain Bike (MTB)</option>
              <option value="Single Speed" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Single Speed / City Cycle</option>
              <option value="Other" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-white/70 uppercase">Club Event T-Shirt</label>
            <select
              value={jerseySize}
              onChange={(e) => setJerseySize(e.target.value as any)}
              className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/50 dark:border-white/15 dark:text-white text-sm focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden"
            >
              <option value="None" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">None needed</option>
              <option value="S" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Small (S - 38)</option>
              <option value="M" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Medium (M - 40)</option>
              <option value="L" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Large (L - 42)</option>
              <option value="XL" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Extra Large (XL - 44)</option>
              <option value="2XL" className="bg-white text-slate-900 dark:bg-[#11140e] dark:text-white">Double XL (2XL - 46)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Safety Agreement */}
      <div className="glass-panel rounded-2xl border border-black/10 dark:border-white/10 p-4 sm:p-5 text-xs">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            required
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-black text-[#4d710d] dark:text-[#b8f04c] focus:ring-[#4d710d] dark:focus:ring-[#b8f04c] mt-0.5 shrink-0"
          />
          <span className="text-slate-800 dark:text-white/80 font-medium leading-relaxed">
            I understand that a <strong>cycling helmet is mandatory</strong> for the entire ride. I am medically fit and agree to follow the Anand Cycling Club safety rules.
          </span>
        </label>
      </div>

      {/* Summary Bar & Glossy Button */}
      <div className="glass-panel rounded-2xl border border-black/10 dark:border-white/15 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="text-center sm:text-left">
          <span className="text-[11px] uppercase text-slate-500 dark:text-white/50 block font-semibold">Total Registration Fee</span>
          <span className="text-3xl sm:text-4xl font-black text-[#335306] dark:text-[#b8f04c]">
            {formatINR(event.registration_fee_paise)}
          </span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-glossy-lime w-full sm:w-auto px-8 py-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>PROCEED TO PAYMENT</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

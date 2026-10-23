'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, AlertCircle, PhoneCall } from 'lucide-react';
import { CLUB_NAME, CLUB_CONTACT_PHONE } from '@/lib/constants';

export function RegistrationLookupView() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const term = searchTerm.trim().toUpperCase();
    if (!term) {
      setErrorMessage('Please enter your Reference Code (e.g. ACC-2026-N78K)');
      return;
    }

    router.push(`/registrations/${term}`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-24 sm:py-32 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-[#4d710d] dark:text-[#b8f04c] flex items-center justify-center mx-auto shadow-lg">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase event-heading tracking-tight">
          FIND RIDER PASS
        </h1>
        <p className="text-xs sm:text-sm uppercase event-body tracking-wider">
          Enter your unique registration reference to retrieve your official digital bib.
        </p>
      </div>

      <div className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        <form onSubmit={handleSearch} className="space-y-4 text-xs font-semibold">
          <div className="space-y-2">
            <label className="text-slate-700 dark:text-white/70 uppercase block text-[11px]">
              REGISTRATION REFERENCE CODE
            </label>
            <input
              type="text"
              required
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. ACC-2026-N78K"
              className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-black/60 dark:text-white dark:border-white/20 font-mono text-base font-bold uppercase tracking-wider focus:border-[#4d710d] dark:focus:border-[#b8f04c] outline-hidden transition-colors"
            />
          </div>

          {errorMessage && (
            <p className="text-rose-500 font-semibold text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </p>
          )}

          <button
            type="submit"
            className="btn-glossy-lime w-full py-4 rounded-xl uppercase tracking-wider text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>RETRIEVE DIGITAL PASS</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-white/40">
          <span>COORDINATOR HELPLINE:</span>
          <a href={`tel:${CLUB_CONTACT_PHONE.replace(/\s+/g, '')}`} className="text-slate-900 dark:text-white font-bold hover:text-[#4d710d] dark:hover:text-[#b8f04c]">
            {CLUB_CONTACT_PHONE}
          </a>
        </div>
      </div>
    </div>
  );
}

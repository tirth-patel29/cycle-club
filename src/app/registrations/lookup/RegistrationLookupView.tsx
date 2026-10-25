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
    <div className="max-w-xl mx-auto px-4 py-20 sm:py-28 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[#EAEDE2] border border-[#d2d7c5] text-[#171914] flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#171914] tracking-tight">
          FIND RIDER PASS
        </h1>
        <p className="text-xs sm:text-sm text-[#62645C] tracking-wide">
          Enter your unique registration reference code to retrieve your official digital bib.
        </p>
      </div>

      <div className="surface-card rounded-3xl border border-[#E5E6DE] p-6 sm:p-8 space-y-6 shadow-lg">
        <form onSubmit={handleSearch} className="space-y-4 text-xs font-semibold">
          <div className="space-y-2">
            <label className="text-[#171914] uppercase block text-[11px] tracking-wider">
              REGISTRATION REFERENCE CODE
            </label>
            <input
              type="text"
              required
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. ACC-2026-N78K"
              className="w-full px-4 py-3.5 rounded-xl bg-[#F7F7F2] text-[#171914] border border-[#E5E6DE] font-mono text-base font-bold uppercase tracking-wider focus:border-[#171914] focus:bg-white outline-hidden transition-all placeholder:text-[#62645C]/50"
            />
          </div>

          {errorMessage && (
            <p className="text-rose-600 font-semibold text-xs flex items-center gap-1.5 bg-rose-50 p-3 rounded-lg border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </p>
          )}

          <button
            type="submit"
            className="btn-glossy-lime w-full py-4 rounded-xl uppercase tracking-wider text-xs font-black flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>RETRIEVE DIGITAL PASS</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5E6DE] flex items-center justify-between text-xs text-[#62645C]">
          <span className="text-[11px] uppercase tracking-wider">COORDINATOR HELPLINE:</span>
          <a href={`tel:${CLUB_CONTACT_PHONE.replace(/\s+/g, '')}`} className="text-[#171914] font-bold hover:underline">
            {CLUB_CONTACT_PHONE}
          </a>
        </div>
      </div>
    </div>
  );
}

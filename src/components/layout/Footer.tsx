import React from 'react';
import Link from 'next/link';
import { Bike, ShieldCheck } from 'lucide-react';
import { CLUB_NAME, CLUB_LOCATION, CLUB_CONTACT_EMAIL, CLUB_CONTACT_PHONE } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="w-full bg-[#f0f4ea] dark:bg-[#0a0d09] border-t border-black/10 dark:border-white/10 text-slate-700 dark:text-white/70 py-10 relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-black/10 dark:border-white/5">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#b8f04c] text-[#0c1204] flex items-center justify-center font-bold shadow-sm">
              <Bike className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-950 dark:text-white uppercase tracking-tight">
                {CLUB_NAME}
              </span>
              <p className="text-slate-500 dark:text-white/40 text-xs">
                {CLUB_LOCATION}
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold">
            <Link href="/" className="text-slate-700 hover:text-black dark:text-white/70 dark:hover:text-white transition-colors">Home</Link>
            <Link href="/#events" className="text-slate-700 hover:text-black dark:text-white/70 dark:hover:text-white transition-colors">Upcoming Rides</Link>
            <Link href="/events" className="text-slate-700 hover:text-black dark:text-white/70 dark:hover:text-white transition-colors">All Events</Link>
            <Link href="/registrations/lookup" className="text-[#4d710d] dark:text-[#b8f04c] font-bold hover:underline transition-colors">Find My Pass</Link>
          </div>

          {/* Contact */}
          <div className="text-xs text-slate-600 dark:text-white/60 space-y-0.5">
            <p>Helpline: <strong className="text-slate-900 dark:text-white">{CLUB_CONTACT_PHONE}</strong></p>
            <p>{CLUB_CONTACT_EMAIL}</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-white/40">
          <p>© {new Date().getFullYear()} {CLUB_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safety First • Helmets Mandatory</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

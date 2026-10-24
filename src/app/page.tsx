import React from 'react';
import Link from 'next/link';
import { CLUB_NAME } from '@/lib/constants';
import {
  ChevronRight,
  ShieldCheck,
  Bike,
  Activity,
  Compass,
  Zap,
  Radio,
  Users2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="w-full pt-24 sm:pt-28 pb-16 space-y-16 sm:space-y-24">
      {/* SECTION 1: HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Simple Club Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-900/10 dark:border-white/15 text-[#3b5e08] dark:text-[#b8f04c] text-xs font-bold uppercase tracking-wider shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#4a7209] dark:bg-[#b8f04c] animate-pulse" />
            <span>{CLUB_NAME} • GUJARAT</span>
          </div>

          {/* Bold Impact Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-slate-950 dark:text-white leading-none">
              RIDE BEYOND<br />
              <span className="text-slate-400 dark:text-white/40">THE ORDINARY.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-700 dark:text-[#d1d6cb] max-w-xl font-medium leading-relaxed">
              Gujarat’s premier community cycling collective. Weekend dawn pelotons, Charotar canal pacelines, and endurance brevets across Anand.
            </p>
          </div>

          {/* Glossy Buttons Pair */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <Link
              href="/auth/signup?returnUrl=/events"
              className="btn-glossy-lime py-4 px-8 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 text-center shadow-lg hover:scale-[1.02] transition-transform"
            >
              <span>JOIN THE RIDE</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </Link>

            <Link
              href="/events"
              className="btn-glossy-dark py-4 px-7 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-center text-slate-800 dark:text-white hover:border-[#b8f04c]/40 transition-colors"
            >
              <Compass className="w-4 h-4 text-[#b8f04c]" />
              <span>EXPLORE ALL EVENTS</span>
            </Link>
          </div>

          {/* Hero Image Showcase */}
          <div className="relative w-full rounded-2xl overflow-hidden glass-panel border border-black/10 dark:border-white/10 shadow-2xl">
            <div className="relative w-full h-[280px] sm:h-[440px] lg:h-[520px] bg-black">
              <img
                src="https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=2000&q=80"
                alt="Anand Cycling Club peloton"
                className="w-full h-full object-cover object-center opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e120d] via-black/20 to-transparent" />

              {/* Quick Trust Badges in Bottom Overlay (White text over photo) */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                <div className="photo-overlay-pill px-3.5 py-1.5 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#b8f04c]" />
                  <span>Helmets Compulsory</span>
                </div>
                <div className="photo-overlay-pill px-3.5 py-1.5 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#b8f04c]" />
                  <span>Backup SAG Support Van</span>
                </div>
                <div className="photo-overlay-pill px-3.5 py-1.5 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#b8f04c]" />
                  <span>Road • Hybrid • MTB • City • Gravel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CLUB MANIFESTO & IDENTITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-100 dark:bg-zinc-900/40 border border-slate-200 dark:border-white/10 backdrop-blur-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#3b5e08] dark:text-[#b8f04c]">
              THE COLLECTIVE MANIFESTO
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
              DISCIPLINE. CADENCE. COMMUNITY.
            </h2>
            <p className="text-sm sm:text-base text-slate-700 dark:text-zinc-300 leading-relaxed">
              Anand Cycling Club was born out of the milk capital of India with a single principle: road safety, athletic progression, and zero barriers to entry. Whether you ride a carbon aero racer, a gravel grinder, or a trusty city hybrid, our pacelines roll together.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 mt-8 border-t border-slate-200 dark:border-white/10">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">1,250+</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-1">Active Riders</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#3b5e08] dark:text-[#b8f04c] font-mono">48+</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-1">Organized Rides</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">100%</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-1">Zero-Drop Guarantee</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#3b5e08] dark:text-[#b8f04c] font-mono">5</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-1">Bicycle Classes</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE THREE PILLARS (Stitch Design Reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#3b5e08] dark:text-[#b8f04c]">
            STANDARDS OF THE PELOTON
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
            ENGINEERED FOR SAFE ENDURANCE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-lg hover:border-[#b8f04c]/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-lime-500/10 text-[#3b5e08] dark:text-[#b8f04c] flex items-center justify-center border border-lime-500/20">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold uppercase text-slate-900 dark:text-white tracking-wide">
                TELEMETRY & RFID TIMING
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Live chip-timed checkpoints on all major stages. Instant digital bib allocation, split times, and verified digital finisher certificates.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-slate-400">
              PILLAR 01 // PRECISION
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-lg hover:border-[#b8f04c]/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-lime-500/10 text-[#3b5e08] dark:text-[#b8f04c] flex items-center justify-center border border-lime-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold uppercase text-slate-900 dark:text-white tracking-wide">
                ZERO-DROP ESCORT
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                No rider gets left behind on Gujarat highways. Every ride features trained ride captains, sweep marshals, and a dedicated mechanical SAG van with spare tubes and hydration.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-slate-400">
              PILLAR 02 // SAFETY
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-lg hover:border-[#b8f04c]/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-lime-500/10 text-[#3b5e08] dark:text-[#b8f04c] flex items-center justify-center border border-lime-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold uppercase text-slate-900 dark:text-white tracking-wide">
                PACELINE TRAINING
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Learn group drafting techniques, rotating echelons, hand signals, and cadence discipline to preserve watts and conquer 100km+ routes with ease.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-slate-400">
              PILLAR 03 // VELOCITY
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: INVITATION TO RIDE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-lime-500/20 via-zinc-900/10 to-transparent border border-lime-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
              READY FOR THIS WEEKEND’S STAGE?
            </h3>
            <p className="text-sm text-slate-700 dark:text-zinc-300">
              Check out upcoming community morning loops, canal centuries, and gravel challenges.
            </p>
          </div>

          <Link
            href="/events"
            className="btn-glossy-lime py-3.5 px-8 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-lg"
          >
            <span>VIEW EVENT CALENDAR</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>
      </section>
    </div>
  );
}

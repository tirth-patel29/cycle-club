import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { CLUB_NAME } from '@/lib/constants';
import { EventPoster } from '@/components/events/EventPoster';
import { EventCard } from '@/components/events/EventCard';
import { ChevronRight, ShieldCheck, Bike, CheckCircle2 } from 'lucide-react';

export default async function HomePage() {
  const publishedEvents = await db.getEvents();
  const featuredEvent = publishedEvents[0] || null;
  const remainingEvents = publishedEvents.slice(1);

  return (
    <div className="w-full pt-24 sm:pt-28 pb-16 space-y-12 sm:space-y-16">
      {/* SECTION 1: HERO (Clean, simple, no fancy dispatch line, minimal text) */}
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
              Weekend community rides, canal pacelines, and century brevets in Anand. Open to all riders and bicycles.
            </p>
          </div>

          {/* Glossy Buttons Pair */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <Link
              href="#events"
              className="btn-glossy-lime py-3.5 px-7 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 text-center"
            >
              <span>VIEW UPCOMING RIDES</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </Link>

            <Link
              href="/registrations/lookup"
              className="btn-glossy-dark py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-center"
            >
              <ShieldCheck className="w-4 h-4 text-[#b8f04c]" />
              <span>FIND MY RIDER PASS</span>
            </Link>
          </div>

          {/* Hero Image Showcase */}
          <div className="relative w-full rounded-2xl overflow-hidden glass-panel border border-black/10 dark:border-white/10 shadow-2xl">
            <div className="relative w-full h-[260px] sm:h-[400px] lg:h-[480px] bg-black">
              <img
                src="https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=2000&q=80"
                alt="Anand Cycling Club peloton"
                className="w-full h-full object-cover object-center opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e120d] via-transparent to-transparent" />

              {/* Quick Trust Badges in Bottom Overlay (Always white text over photo) */}
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
                  <span>Breakfast & Finisher Medals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURED RIDE */}
      {featuredEvent && (
        <section id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 scroll-mt-24">
          <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-950 dark:text-white tracking-tight">
              FEATURED UPCOMING RIDE
            </h2>
            <Link
              href="/events"
              className="text-xs font-bold text-[#3b5e08] dark:text-[#b8f04c] hover:underline uppercase flex items-center gap-1"
            >
              <span>ALL RIDES ({publishedEvents.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <EventPoster event={featuredEvent} />
        </section>
      )}

      {/* SECTION 3: MORE RIDES (Clean Grid) */}
      {remainingEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="pb-2 border-b border-black/10 dark:border-white/10">
            <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-950 dark:text-white tracking-tight">
              MORE RIDES ON CALENDAR
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {remainingEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

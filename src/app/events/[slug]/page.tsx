import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { formatINR, formatDateIndian, formatTimeIndian, CLUB_CONTACT_PHONE } from '@/lib/constants';
import {
  Calendar, Clock, MapPin, CheckCircle2, ArrowRight, ChevronLeft, ShieldCheck
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await db.getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const isRegistrationOpen = new Date() <= new Date(event.registration_closes_at) && event.status === 'published';

  return (
    <div className="pt-24 sm:pt-28 pb-20 space-y-6 sm:space-y-8">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-white/60 hover:text-slate-950 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Main Header / Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 min-h-[300px] sm:min-h-[400px] flex flex-col justify-end p-6 sm:p-10 shadow-2xl">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d0a] via-[#0b0d0a]/70 to-transparent" />

          <div className="relative z-10 space-y-3 max-w-3xl">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase">
              <span className="bg-[#b8f04c] text-[#0c1204] font-black px-3.5 py-1 rounded-md">
                {event.distance_km} KM
              </span>
              <span className="bg-white/15 text-white px-3 py-1 rounded-md border border-white/10">
                {event.difficulty}
              </span>
              <span className="bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>REGISTRATIONS OPEN</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-tight">
              {event.title}
            </h1>

            <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
      </section>

      {/* Two-Column Details & Registration Dock */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column (8 cols): Spec grid & Amenities */}
          <div className="lg:col-span-8 space-y-6">
            {/* Simple Spec Grid */}
            <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8 space-y-5">
              <h2 className="text-sm font-extrabold uppercase text-[#557b12] dark:text-[#b8f04c] tracking-wider">
                RIDE SCHEDULE & ROUTE DETAILS
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-4 rounded-xl event-venue-box">
                  <span className="text-[11px] uppercase opacity-60 block font-semibold">DATE & TIMING</span>
                  <p className="text-base font-extrabold event-heading">
                    {formatDateIndian(event.starts_at)}
                  </p>
                  <p className="text-xs text-[#557b12] dark:text-[#b8f04c] font-semibold">
                    Flag-Off: {formatTimeIndian(event.starts_at)} • Reporting: {event.reporting_time || '05:30 AM'}
                  </p>
                </div>

                <div className="space-y-1 p-4 rounded-xl event-venue-box">
                  <span className="text-[11px] uppercase opacity-60 block font-semibold">STARTING POINT</span>
                  <p className="text-base font-extrabold event-heading">
                    {event.venue}
                  </p>
                  <p className="text-xs event-body">
                    {event.location_description}
                  </p>
                </div>

                <div className="space-y-1 p-4 rounded-xl event-venue-box">
                  <span className="text-[11px] uppercase opacity-60 block font-semibold">DISTANCE & ELEVATION</span>
                  <p className="text-base font-extrabold event-heading">
                    {event.distance_km} KM • +{event.elevation_gain_m}m Elevation
                  </p>
                  <p className="text-xs event-body">
                    Smooth tarmac road with scenic rural stretches
                  </p>
                </div>

                <div className="space-y-1 p-4 rounded-xl event-venue-box">
                  <span className="text-[11px] uppercase opacity-60 block font-semibold">EXPECTED SPEED</span>
                  <p className="text-base font-extrabold event-heading">
                    {event.pace_guide || '20 - 28 KM/H'}
                  </p>
                  <p className="text-xs event-body">
                    Ride marshals guiding front and rear peloton
                  </p>
                </div>
              </div>
            </div>

            {/* Inclusions */}
            {event.amenities && (
              <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8 space-y-4">
                <h3 className="text-sm font-extrabold uppercase text-[#557b12] dark:text-[#b8f04c] tracking-wider">
                  WHAT IS INCLUDED
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {event.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3.5 rounded-xl event-venue-box font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#557b12] dark:text-[#b8f04c] shrink-0 mt-0.5" />
                      <span className="event-body">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Sticky Registration Dock */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 sm:top-28 glass-panel rounded-2xl border border-black/10 dark:border-white/15 p-6 sm:p-8 space-y-5 shadow-2xl">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50 block">
                  ENTRY FEE
                </span>
                <div className="flex items-baseline gap-2 pt-1 font-sans">
                  <span className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
                    {formatINR(event.registration_fee_paise)}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-white/60 font-semibold">
                    per rider
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between text-slate-700 dark:text-white/70">
                  <span>Registration Closes:</span>
                  <span className="text-slate-950 dark:text-white font-bold">{formatDateIndian(event.registration_closes_at)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-white/70">
                  <span>Eligibility:</span>
                  <span className="text-slate-950 dark:text-white font-bold">12+ Years (Any Bike)</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-white/70">
                  <span>Rider Pass:</span>
                  <span className="text-[#335306] dark:text-[#b8f04c] font-bold">Instant Digital Pass & QR</span>
                </div>
              </div>

              {/* Glossy Button */}
              {isRegistrationOpen ? (
                <div className="pt-2">
                  <Link
                    href={`/events/${event.slug}/register`}
                    className="btn-glossy-lime w-full py-4 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
                  >
                    <span>REGISTER NOW</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 text-center text-xs font-bold text-slate-600 dark:text-white/60">
                  Registration Closed
                </div>
              )}

              <p className="text-xs text-center text-slate-600 dark:text-white/50 pt-2 border-t border-black/10 dark:border-white/5 font-medium">
                Helpline: <strong className="text-slate-950 dark:text-white">{CLUB_CONTACT_PHONE}</strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

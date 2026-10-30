import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { formatINR, formatDateIndian, formatTimeIndian, CLUB_CONTACT_PHONE } from '@/lib/constants';
import {
  Calendar, Clock, MapPin, CheckCircle2, ArrowRight, ChevronLeft, ShieldCheck, Mountain, Gauge
} from 'lucide-react';
import { LiveRegistrationProgress } from '@/components/events/LiveRegistrationProgress';
import { SponsorSection } from '@/components/events/SponsorSection';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await db.getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const capacityInfo = await db.getEventCapacity(event.id);
  const isSoldOut = capacityInfo.is_full;
  const isRegistrationOpen = new Date() <= new Date(event.registration_closes_at) && event.status === 'published';
  const canRegister = isRegistrationOpen && !isSoldOut;
  const isFree = event.registration_fee_paise === 0;

  return (
    <div className="w-full bg-[#F7F7F2] min-h-screen pt-24 sm:pt-28 pb-20 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#62645C] hover:text-[#171914] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Main Event Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-[#E5E6DE] min-h-[320px] sm:min-h-[420px] flex flex-col justify-end p-6 sm:p-12 shadow-md bg-[#171914]">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171914]/95 via-[#171914]/60 to-transparent" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase">
              <span className="bg-[#C7F36B] text-[#171914] font-black px-3.5 py-1 rounded-md shadow-xs">
                {event.distance_km} KM
              </span>
              <span className="photo-overlay-pill px-3 py-1 rounded-md">
                {event.difficulty}
              </span>
              {isSoldOut ? (
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>REGISTRATION FULL</span>
                </span>
              ) : isRegistrationOpen ? (
                <span className="bg-[#C7F36B]/20 text-[#C7F36B] border border-[#C7F36B]/40 px-3 py-1 rounded-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C7F36B]" />
                  <span>REGISTRATIONS OPEN</span>
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-md">
                  REGISTRATION CLOSED
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-tight font-sans">
              {event.title}
            </h1>

            <p className="text-sm sm:text-base text-white/85 max-w-2xl leading-relaxed font-medium">
              {event.description}
            </p>
          </div>
        </div>
      </section>

      {/* Two-Column Details & Registration Dock */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Route specs & Inclusions */}
          <div className="lg:col-span-8 space-y-8">
            {/* Spec Grid */}
            <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-xs font-bold uppercase text-[#3F6212] tracking-wider font-mono">
                RIDE SCHEDULE & ROUTE SPECIFICATIONS
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-4 rounded-xl bg-[#F7F7F2] border border-[#E5E6DE]">
                  <span className="text-[11px] uppercase text-[#62645C] block font-semibold">DATE & TIMING</span>
                  <p className="text-base font-extrabold text-[#171914]">
                    {formatDateIndian(event.starts_at)}
                  </p>
                  <p className="text-xs text-[#3F6212] font-bold">
                    Flag-Off: {formatTimeIndian(event.starts_at)} • Reporting: {event.reporting_time || '05:30 AM'}
                  </p>
                </div>

                <div className="space-y-1 p-4 rounded-xl bg-[#F7F7F2] border border-[#E5E6DE]">
                  <span className="text-[11px] uppercase text-[#62645C] block font-semibold">STARTING POINT & VENUE</span>
                  <p className="text-base font-extrabold text-[#171914]">
                    {event.venue}
                  </p>
                  <p className="text-xs text-[#62645C] font-medium">
                    {event.location_description}
                  </p>
                </div>

                <div className="space-y-1 p-4 rounded-xl bg-[#F7F7F2] border border-[#E5E6DE]">
                  <span className="text-[11px] uppercase text-[#62645C] block font-semibold">DISTANCE & ELEVATION</span>
                  <p className="text-base font-extrabold text-[#171914] flex items-center gap-1.5">
                    <Mountain className="w-4 h-4 text-[#3F6212]" />
                    <span>{event.distance_km} KM • +{event.elevation_gain_m}m</span>
                  </p>
                  <p className="text-xs text-[#62645C] font-medium">
                    Smooth tarmac road with scenic rural stretches
                  </p>
                </div>

                <div className="space-y-1 p-4 rounded-xl bg-[#F7F7F2] border border-[#E5E6DE]">
                  <span className="text-[11px] uppercase text-[#62645C] block font-semibold">PACE & ESCORT</span>
                  <p className="text-base font-extrabold text-[#171914] flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-[#3F6212]" />
                    <span>{event.pace_guide || '20 - 28 KM/H'}</span>
                  </p>
                  <p className="text-xs text-[#62645C] font-medium">
                    Ride marshals guiding front and rear of the pack
                  </p>
                </div>
              </div>
            </div>

            {/* Inclusions */}
            {event.amenities && (
              <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-5">
                <h3 className="text-xs font-bold uppercase text-[#3F6212] tracking-wider font-mono">
                  WHAT IS INCLUDED WITH YOUR REGISTRATION
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {event.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F7F7F2] border border-[#E5E6DE] font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#3F6212] shrink-0 mt-0.5" />
                      <span className="text-[#171914]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Sticky Registration Dock & Sponsors */}
          <div className="lg:col-span-4 space-y-6">
            <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#62645C] block font-mono">
                  ENTRY FEE
                </span>
                <div className="flex items-baseline gap-2 pt-1 font-sans">
                  <span className="text-4xl sm:text-5xl font-black text-[#171914] tracking-tight">
                    {isFree ? 'FREE' : formatINR(event.registration_fee_paise)}
                  </span>
                  <span className="text-xs text-[#62645C] font-semibold">
                    per rider
                  </span>
                </div>
              </div>

              {/* LIVE REGISTRATION CAPACITY PROGRESS */}
              <LiveRegistrationProgress
                eventId={event.id}
                initialCapacity={capacityInfo}
              />

              <div className="pt-2 border-t border-[#E5E6DE] space-y-3 text-xs font-semibold">
                <div className="flex justify-between text-[#62645C]">
                  <span>Registration Closes:</span>
                  <span className="text-[#171914] font-bold">{formatDateIndian(event.registration_closes_at)}</span>
                </div>
                <div className="flex justify-between text-[#62645C]">
                  <span>Eligibility:</span>
                  <span className="text-[#171914] font-bold">12+ Years (Any Bike)</span>
                </div>
                <div className="flex justify-between text-[#62645C]">
                  <span>Rider Pass:</span>
                  <span className="text-[#3F6212] font-bold">Instant Digital Pass & QR</span>
                </div>
              </div>

              {/* Action Button */}
              {canRegister ? (
                <div className="pt-2">
                  <Link
                    href={`/events/${event.slug}/register`}
                    className="btn-glossy-lime w-full py-4 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
                  >
                    <span>REGISTER NOW</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </Link>
                </div>
              ) : isSoldOut ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center text-xs font-black uppercase tracking-wider text-rose-700">
                  REGISTRATION FULL // SOLD OUT
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#EAEDE2] text-center text-xs font-bold text-[#62645C]">
                  Registration Closed
                </div>
              )}

              <p className="text-xs text-center text-[#62645C] pt-2 border-t border-[#E5E6DE] font-medium">
                Helpline:{' '}
                <a href={`tel:${CLUB_CONTACT_PHONE}`} className="text-[#171914] font-bold hover:underline">
                  {CLUB_CONTACT_PHONE}
                </a>
              </p>
            </div>

            {/* EVENT SPONSORS */}
            <SponsorSection sponsors={event.sponsors} />
          </div>
        </div>
      </section>
    </div>
  );
}

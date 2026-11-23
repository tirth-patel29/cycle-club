import React from 'react';
import Link from 'next/link';
import { CLUB_NAME } from '@/lib/constants';
import { HeroBannerImage } from '@/components/home/HeroBannerImage';
import { GallerySection } from '@/components/home/GallerySection';
import { ScrollingAnnouncementTicker } from '@/components/home/ScrollingAnnouncementTicker';
import { AnnouncementPosterModal } from '@/components/events/AnnouncementPosterModal';
import { db } from '@/lib/db';
import {
  Compass,
  ArrowRight
} from 'lucide-react';

export const revalidate = 0;

export default async function HomePage() {
  const [activePopupEvent, nearestUpcomingEvent] = await Promise.all([
    db.getActiveAnnouncementPopup(),
    db.getNearestUpcomingEvent()
  ]);

  return (
    <div className="w-full pt-20 sm:pt-24 pb-0 flex flex-col">
      {/* ========================================================
          SLIM SCROLLING ANNOUNCEMENT TICKER (Full-width marquee)
          ======================================================== */}
      <ScrollingAnnouncementTicker event={nearestUpcomingEvent} />

      {/* ========================================================
          ANNOUNCEMENT POSTER POPUP (Centered modal on website entry)
          ======================================================== */}
      <AnnouncementPosterModal event={activePopupEvent} />

      {/* ========================================================
          SECTION 1: HERO & BRAND INTRODUCTION (Warm Ivory #F7F7F2)
          ======================================================== */}
      <section className="w-full bg-[#F7F7F2] py-8 sm:py-14 lg:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="max-w-4xl space-y-4 sm:space-y-6">
            {/* Editorial Club Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAEDE2] border border-[#E5E6DE] text-[#3F6212] text-xs font-bold uppercase tracking-wider shadow-xs animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-[#8cc427] animate-pulse" />
              <span>{CLUB_NAME} • GUJARAT OFFICIAL CLUB</span>
            </div>

            {/* Athletic Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#171914] leading-[0.95] font-sans animate-fade-up animate-delay-1">
              RIDE BEYOND<br />
              <span className="text-[#8B8D83]">THE ORDINARY.</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#62645C] max-w-2xl font-medium leading-relaxed animate-fade-up animate-delay-2">
              Gujarat&apos;s premier community cycling collective. Weekend dawn pacelines, Charotar canal routes, and endurance brevets across Anand and beyond.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 animate-fade-up animate-delay-3">
              <Link
                href="/events"
                className="btn-glossy-lime py-4 px-8 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 text-center shadow-md hover:scale-[1.01]"
              >
                <Compass className="w-4 h-4" />
                <span>EXPLORE ALL EVENTS</span>
              </Link>
            </div>
          </div>

          {/* Hero Cycling Photography Showcase */}
          <HeroBannerImage alt={`${CLUB_NAME} riders riding at dawn across Charotar`} />
        </div>
      </section>

      {/* ========================================================
          SECTION 2: CLUB MANIFESTO & STATS (Muted Sage #EAEDE2)
          ======================================================== */}
      <section className="w-full bg-[#EAEDE2] border-y border-[#E5E6DE] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3F6212]">
              THE COLLECTIVE MANIFESTO
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-[#171914] tracking-tight leading-tight">
              DISCIPLINE. CADENCE. COMMUNITY.
            </h2>
            <p className="text-sm sm:text-base text-[#62645C] leading-relaxed font-medium">
              {CLUB_NAME} was born out of the milk capital of India with a single principle: road safety, athletic progression, and zero barriers to entry. Whether you ride a carbon aero racer, a gravel grinder, or a trusty city hybrid, our pacelines roll together.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 3: REAL GALLERY SECTION
          ======================================================== */}
      <GallerySection />

      {/* ========================================================
          SECTION 4: INVITATION TO RIDE BANNER
          ======================================================== */}
      <section className="w-full bg-[#171914] text-white py-16 sm:py-20 border-t border-[#2A2D24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-black uppercase tracking-widest text-[#C7F36B]">
              JOIN THE REVOLUTION
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
              YOUR NEXT MILESTONE STARTS HERE.
            </h3>
            <p className="text-xs sm:text-sm text-[#8B8D83] leading-relaxed">
              No elite prerequisites. Just a helmet, a working bike, and a desire to discover Gujarat on two wheels.
            </p>
          </div>
          <Link
            href="/events"
            className="btn-glossy-lime shrink-0 py-4 px-8 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg"
          >
            <span>JOIN OUR NEXT RIDE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

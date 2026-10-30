import React from 'react';
import Link from 'next/link';
import { CLUB_NAME } from '@/lib/constants';
import { HeroBannerImage } from '@/components/home/HeroBannerImage';
import { GallerySection } from '@/components/home/GallerySection';
import {
  Compass,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="w-full pt-20 sm:pt-24 pb-0 flex flex-col">
      {/* ========================================================
          SECTION 1: HERO & BRAND INTRODUCTION (Warm Ivory #F7F7F2)
          ======================================================== */}
      <section className="w-full bg-[#F7F7F2] py-10 sm:py-16 lg:py-20">
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
              Gujarat's premier community cycling collective. Weekend dawn pacelines, Charotar canal routes, and endurance brevets across Anand and beyond.
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
      <section className="w-full bg-[#FFFFFF] border-t border-[#E5E6DE] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#EAEDE2] border border-[#E5E6DE] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-[#171914] tracking-tight">
                READY TO RIDE WITH THE ANAND CYCLING CLUB?
              </h3>
              <p className="text-xs sm:text-sm text-[#62645C] font-medium max-w-xl">
                Community dawn loops, canal centuries, and endurance challenges across Gujarat. Secure your bib for the next stage.
              </p>
            </div>

            <Link
              href="/events"
              className="btn-glossy-lime py-4 px-8 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-md"
            >
              <span>EXPLORE CLUB CALENDAR</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

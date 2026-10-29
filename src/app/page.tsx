import React from 'react';
import Link from 'next/link';
import { CLUB_NAME } from '@/lib/constants';
import { HeroBannerImage } from '@/components/home/HeroBannerImage';
import { ChevronRight, Compass, BookOpen, ShieldCheck } from 'lucide-react';

const RULES_PREVIEW = [
  { num: '01', title: 'HELMET — ZERO TOLERANCE', summary: 'Certified helmet, strapped and worn at all times. No exceptions.' },
  { num: '02', title: 'ILLUMINATION', summary: 'Front white light (100+ lumens) & rear red blinker for all dawn or evening rides.' },
  { num: '03', title: 'BICYCLE ROADWORTHINESS', summary: 'Rider is solely responsible for mechanical soundness before flag-off.' },
  { num: '04', title: 'TRAFFIC COMPLIANCE', summary: 'Follow Indian MVA rules, ride left, stop at signals, obey Ride Captains.' },
  { num: '05', title: 'PACELINE ETIQUETTE', summary: 'Safe wheel gap, hand signals mandatory, no sudden braking without warning.' },
  { num: '06', title: 'AGE & ELIGIBILITY', summary: '12+ for leisure, 14+ for 45 km, 18+ for century. Guardian consent under 18.' },
  { num: '07', title: 'BIB & REGISTRATION', summary: 'Bibs are personal, non-transferable. Report 30 min before flag-off.' },
  { num: '08', title: 'CANCELLATION & REFUND', summary: '7+ days: 80% refund. 3–7 days: 50%. Under 48 hrs: no refund.' },
  { num: '09', title: 'MEDICAL & EMERGENCY', summary: 'Carry valid ID and emergency contact. First Aid team present at all events.' },
  { num: '10', title: 'CODE OF CONDUCT', summary: 'Mutual respect is mandatory. Harassment of any kind = permanent ban.' },
  { num: '11', title: 'PHOTOGRAPHY & MEDIA', summary: 'Event photos may be used for club promotions. Opt-out by prior written request.' },
  { num: '12', title: 'PRIVACY POLICY', summary: 'Your data is used only for event management. Never sold. Razorpay handles payments.' },
  { num: '13', title: 'ACCEPTANCE', summary: 'Registering = accepting these rules in full. Rules may be updated on this page.' },
];

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
                href="/auth/signup?returnUrl=/events"
                className="btn-glossy-lime py-4 px-8 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 text-center shadow-md hover:scale-[1.01]"
              >
                <span>JOIN THE RIDE</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </Link>

              <Link
                href="/events"
                className="btn-glossy-dark py-4 px-7 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-center"
              >
                <Compass className="w-4 h-4 text-[#C7F36B]" />
                <span>EXPLORE ALL EVENTS</span>
              </Link>
            </div>
          </div>

          {/* Hero Photo */}
          <HeroBannerImage alt={`${CLUB_NAME} riders riding at dawn across Charotar`} />
        </div>
      </section>

      {/* ========================================================
          SECTION 2: THE RULE BOOK
          ======================================================== */}
      <section className="w-full bg-[#171914] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#C7F36B] text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Official Club Document</span>
              </div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.95]">
                THE<br />
                <span className="text-[#C7F36B]">RULE BOOK.</span>
              </h2>
              <p className="text-xs sm:text-sm text-white/60 max-w-xl font-medium leading-relaxed">
                13 non-negotiable rules every rider in {CLUB_NAME} lives by. Safety, respect, community — read before you ride.
              </p>
            </div>
            <Link
              href="/rules"
              className="btn-glossy-lime py-3.5 px-7 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shrink-0 shadow-md"
            >
              <span>READ FULL RULE BOOK</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {RULES_PREVIEW.map((rule, idx) => (
              <div
                key={rule.num}
                className="group relative p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#C7F36B]/40 transition-all duration-200"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-2xl font-black font-mono text-white/20 group-hover:text-[#C7F36B]/60 transition-colors duration-200 leading-none">
                    {rule.num}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-white/20 group-hover:text-[#C7F36B] transition-colors duration-200 shrink-0 mt-0.5" />
                </div>
                <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white font-mono mb-2 leading-tight">
                  {rule.title}
                </h3>
                <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                  {rule.summary}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA bar */}
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40 font-mono">
              Last updated October 2026 • By registering, you accept all 13 rules.
            </p>
            <Link
              href="/rules"
              className="text-xs font-bold text-[#C7F36B] hover:underline uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <span>View Full Rule Book with Policies</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

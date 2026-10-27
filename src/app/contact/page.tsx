import React from 'react';
import Link from 'next/link';
import { CLUB_NAME, CLUB_CONTACT_EMAIL, CLUB_CONTACT_PHONE, CLUB_LOCATION, CLUB_TAGLINE } from '@/lib/constants';
import { Mail, Phone, MapPin, Bike, Clock, ChevronLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: `Contact & Support • ${CLUB_NAME}`,
  description: `Get in touch with the organizers, route marshals, and administrative committee of ${CLUB_NAME}.`,
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#62645C] hover:text-[#171914] mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-[#3F6212] block mb-2">
          REACH THE PELOTON
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#171914]">
          Contact & Support
        </h1>
        <p className="text-sm text-[#62645C] mt-2 font-medium">
          {CLUB_TAGLINE}. We are here to help riders with bibs, group pacelines, route telemetry, and event logistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Card 1 */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl border border-[#E5E6DE] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#C7F36B]/30 text-[#3F6212] flex items-center justify-center border border-[#C7F36B]/60 shadow-xs">
            <Mail className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-[#62645C] font-bold block">
              OFFICIAL EMAIL
            </span>
            <h2 className="text-lg font-black text-[#171914] mt-1">{CLUB_CONTACT_EMAIL}</h2>
            <p className="text-xs text-[#62645C] mt-1">
              General club inquiries, sponsorship, bib transfers, and rider questions. Average response time: 24 hours.
            </p>
          </div>
        </div>

        {/* Contact Card 2 */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl border border-[#E5E6DE] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#C7F36B]/30 text-[#3F6212] flex items-center justify-center border border-[#C7F36B]/60 shadow-xs">
            <Phone className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-[#62645C] font-bold block">
              RIDER HELPLINE & SAG SUPPORT
            </span>
            <h2 className="text-lg font-black text-[#171914] mt-1">{CLUB_CONTACT_PHONE}</h2>
            <p className="text-xs text-[#62645C] mt-1">
              Active Monday through Saturday, 08:00 AM – 07:00 PM IST. Dedicated emergency hotline during live weekend stages.
            </p>
          </div>
        </div>

        {/* Contact Card 3 */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl border border-[#E5E6DE] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#C7F36B]/30 text-[#3F6212] flex items-center justify-center border border-[#C7F36B]/60 shadow-xs">
            <MapPin className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-[#62645C] font-bold block">
              MEETING POINT & HEADQUARTERS
            </span>
            <h2 className="text-lg font-black text-[#171914] mt-1">{CLUB_LOCATION}</h2>
            <p className="text-xs text-[#62645C] mt-1">
              Primary weekend muster point: Town Hall Grounds, Anand. Dawn roll-out every Sunday morning.
            </p>
          </div>
        </div>

        {/* Contact Card 4 */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl border border-[#E5E6DE] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#C7F36B]/30 text-[#3F6212] flex items-center justify-center border border-[#C7F36B]/60 shadow-xs">
            <Clock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-[#62645C] font-bold block">
              PELOTON RIDE SCHEDULE
            </span>
            <h2 className="text-lg font-black text-[#171914] mt-1">Wednesdays & Sundays</h2>
            <p className="text-xs text-[#62645C] mt-1">
              Mid-week canal tempo ride: Wednesday 05:45 AM.<br />
              Official weekend stage & century brevet: Sunday 05:30 AM.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-[#EAEDE2] border border-[#d2d7c5] rounded-2xl p-6 flex items-start gap-4 text-xs font-semibold text-[#171914]">
        <ShieldCheck className="w-5 h-5 text-[#3F6212] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#3F6212] uppercase block tracking-wider mb-1">
            Emergency SAG Broom Wagon & Medical Team
          </strong>
          <p className="text-[#62645C] font-normal leading-relaxed">
            During live weekend stages, our safety vehicle travels behind the last rider. If you suffer a mechanical breakdown (flat tire, broken chain) or physical fatigue, flag down the marshal or dial the rider helpline for zero-drop assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { CLUB_NAME, CLUB_CONTACT_EMAIL, CLUB_CONTACT_PHONE, CLUB_TAGLINE } from '@/lib/constants';
import { Mail, Phone, MapPin, Clock, ChevronLeft, ArrowRight, ExternalLink } from 'lucide-react';

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
        {/* Contact Card 1: Official Email */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl border border-[#E5E6DE] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#C7F36B]/30 text-[#3F6212] flex items-center justify-center border border-[#C7F36B]/60 shadow-xs">
            <Mail className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-[#62645C] font-bold block">
              OFFICIAL EMAIL
            </span>
            <a
              href={`mailto:${CLUB_CONTACT_EMAIL}`}
              className="inline-block text-lg font-black text-[#171914] mt-1 hover:text-[#3F6212] hover:underline transition-colors break-all"
            >
              <h2>{CLUB_CONTACT_EMAIL}</h2>
            </a>
            <p className="text-xs text-[#62645C] mt-1">
              General club inquiries, sponsorship, bib transfers, and rider questions. Average response time: 24 hours.
            </p>
          </div>
        </div>

        {/* Contact Card 2: Phone / Helpline */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl border border-[#E5E6DE] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#C7F36B]/30 text-[#3F6212] flex items-center justify-center border border-[#C7F36B]/60 shadow-xs">
            <Phone className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-[#62645C] font-bold block">
              RIDER HELPLINE & SAG SUPPORT
            </span>
            <a
              href={`tel:${CLUB_CONTACT_PHONE}`}
              className="inline-block text-lg font-black text-[#171914] mt-1 hover:text-[#3F6212] hover:underline transition-colors"
            >
              <h2>{CLUB_CONTACT_PHONE}</h2>
            </a>
            <p className="text-xs text-[#62645C] mt-1">
              Active Monday through Saturday, 08:00 AM – 07:00 PM IST. Dedicated emergency hotline during live weekend stages.
            </p>
          </div>
        </div>

        {/* Contact Card 3: Meeting Point */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl border border-[#E5E6DE] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#C7F36B]/30 text-[#3F6212] flex items-center justify-center border border-[#C7F36B]/60 shadow-xs">
            <MapPin className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-[#62645C] font-bold block">
              MEETING POINT
            </span>
            <a
              href="https://www.google.com/maps/dir//R+K+%26+Sons+Cycle+Shop,+Shop+No.+13+Embassy+Centre,+Mota+Bazaar,+Vallabh+Vidyanagar,+Anand,+Gujarat+388120/@22.560768,72.9120768,7324m/data=!3m1!1e3!4m8!4m7!1m0!1m5!1m1!1s0x395e4ddf66487a7f:0x998e90906b9fb0bc!2m2!1d72.92658!2d22.547912?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-block hover:underline"
              aria-label="R K & Sons Cycle Shop (opens Google Maps directions in new tab)"
            >
              <h2 className="text-lg font-black text-[#171914] mt-1 group-hover:text-[#3F6212] transition-colors flex items-center gap-1.5">
                <span>R K & Sons Cycle Shop</span>
                <ExternalLink className="w-4 h-4 text-[#8B8D83] group-hover:text-[#3F6212]" />
              </h2>
            </a>
            <p className="text-xs text-[#62645C] mt-1 leading-relaxed">
              Shop No. 13, Embassy Centre, Mota Bazaar, Vallabh Vidyanagar, Anand, Gujarat 388120
            </p>
            <div className="pt-2">
              <a
                href="https://www.google.com/maps/dir//R+K+%26+Sons+Cycle+Shop,+Shop+No.+13+Embassy+Centre,+Mota+Bazaar,+Vallabh+Vidyanagar,+Anand,+Gujarat+388120/@22.560768,72.9120768,7324m/data=!3m1!1e3!4m8!4m7!1m0!1m5!1m1!1s0x395e4ddf66487a7f:0x998e90906b9fb0bc!2m2!1d72.92658!2d22.547912?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3F6212] hover:underline focus:outline-hidden focus:ring-2 focus:ring-[#3F6212] rounded-xs"
              >
                <span>Get Directions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Card 4: Peloton Ride Schedule */}
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
    </div>
  );
}

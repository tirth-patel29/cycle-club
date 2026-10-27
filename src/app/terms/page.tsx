import React from 'react';
import Link from 'next/link';
import { CLUB_NAME, CLUB_CONTACT_EMAIL, CLUB_CONTACT_PHONE, CLUB_LOCATION } from '@/lib/constants';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

export const metadata = {
  title: `Terms & Conditions • ${CLUB_NAME}`,
  description: `Official participation terms, rider code of conduct, and safety regulations for ${CLUB_NAME} events.`,
};

export default function TermsPage() {
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
          OPERATIONAL POLICIES
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#171914]">
          Terms & Conditions
        </h1>
        <p className="text-xs text-[#62645C] mt-2 font-mono">
          Last updated: October 2026 • Effective for all events organized by {CLUB_NAME}
        </p>
      </div>

      <div className="surface-card p-6 sm:p-10 rounded-3xl border border-[#E5E6DE] space-y-8 text-sm leading-relaxed text-[#62645C]">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing this platform, creating a rider profile, or registering for any cycling stage, brevet, or community ride hosted by <strong>{CLUB_NAME}</strong>, you agree to comply with and be legally bound by these Terms and Conditions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            2. Mandatory Rider Safety Regulations
          </h2>
          <p>
            Safety is non-negotiable in the peloton. Every participant agrees to the following standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Helmets Compulsory:</strong> A certified, undamaged cycling helmet must be worn and strapped on at all times while mounted on the bicycle. Failure to wear a helmet results in immediate disqualification with no refund.</li>
            <li><strong>Illumination:</strong> Front white headlights (minimum 100 lumens) and rear flashing red blinkers are mandatory for all sunrise or evening brevets.</li>
            <li><strong>Road Worthiness:</strong> Riders are solely responsible for ensuring their bicycle (brakes, tires, chain, and drivetrain) is mechanically sound before flag-off.</li>
            <li><strong>Traffic Laws:</strong> Cyclists must strictly observe Indian Motor Vehicle traffic rules, stop at highway intersections, and follow instructions given by ride captains and route marshals.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            3. Eligibility and Age Guidelines
          </h2>
          <p>
            Participants must be at least 14 years of age for leisure stages (up to 45 km) and at least 18 years of age for century challenges and brevets (100 km+). Riders under 18 years of age require written consent from a parent or legal guardian during registration.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            4. Digital Bibs and RFID Pass Allocation
          </h2>
          <p>
            Registration fees grant an individualized digital entry bib (public reference), route GPX telemetry, on-course hydration and nutritional support, SAG escort van access, and a digital finisher e-certificate upon verified completion. Bib numbers are personal and cannot be transferred to another individual without prior written organizer approval.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            5. Assumption of Risk & Medical Disclaimer
          </h2>
          <p>
            Open-road endurance cycling involves inherent physical risks including road hazards, variable weather, and cardiac exertion. By registering, you confirm that you are physically fit and medically cleared for long-distance cycling. {CLUB_NAME}, its organizers, volunteers, and marshals assume no liability for personal injury, accidental damage, or property loss during club activities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            6. Contact Information
          </h2>
          <p>
            For inquiries regarding these terms or club governance, contact us at:
          </p>
          <div className="p-4 bg-[#F7F7F2] rounded-xl border border-[#E5E6DE] text-xs font-mono text-[#171914] space-y-1">
            <p><strong>{CLUB_NAME}</strong></p>
            <p>Location: {CLUB_LOCATION}</p>
            <p>Email: {CLUB_CONTACT_EMAIL}</p>
            <p>Rider Helpline: {CLUB_CONTACT_PHONE}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

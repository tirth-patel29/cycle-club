import React from 'react';
import Link from 'next/link';
import { CLUB_NAME, CLUB_CONTACT_EMAIL, CLUB_CONTACT_PHONE, CLUB_LOCATION } from '@/lib/constants';
import { ChevronLeft, BookOpen } from 'lucide-react';

export const metadata = {
  title: `Rule Book • ${CLUB_NAME}`,
  description: `Official rules, code of conduct, safety regulations, refund policy, and privacy guidelines for ${CLUB_NAME} — Gujarat's premier cycling club.`,
};

const RULES = [
  {
    number: '01',
    title: 'HELMET — ZERO TOLERANCE',
    body: 'A certified, undamaged cycling helmet must be worn and properly strapped at all times while on the bicycle. Any rider found without a helmet at the start line or mid-ride will be immediately disqualified with no refund. No exceptions, no negotiations.'
  },
  {
    number: '02',
    title: 'ILLUMINATION & VISIBILITY',
    body: 'A white front headlight (minimum 100 lumens) and a flashing red rear blinker are mandatory for all sunrise, sunset, and evening rides. Reflective gear or a high-visibility vest is strongly recommended for highway brevets.'
  },
  {
    number: '03',
    title: 'BICYCLE ROADWORTHINESS',
    body: 'Riders are solely responsible for ensuring their bicycle is mechanically sound before flag-off — brakes, tires, chain, drivetrain. The club organizers will not be liable for mechanical failures. A pre-ride mechanical check is available at the start venue.'
  },
  {
    number: '04',
    title: 'TRAFFIC & ROAD COMPLIANCE',
    body: 'All cyclists must strictly follow Indian Motor Vehicle traffic laws. Stop at red lights and highway crossings. Ride on the left side. Follow signals from Ride Captains and Route Marshals at all times. Reckless riding results in immediate disqualification.'
  },
  {
    number: '05',
    title: 'PACELINE & GROUP ETIQUETTE',
    body: 'Maintain a safe wheel-to-wheel distance of at least 0.5 metres. No sudden braking without signalling. Hand signals are mandatory before slowing or turning. Overlapping wheels in a mass-start is prohibited. Respect every rider — recreational and competitive alike.'
  },
  {
    number: '06',
    title: 'AGE & ELIGIBILITY',
    body: 'Riders must be at least 12 years of age for rides up to 25 km, 14 years for rides up to 45 km, and 18 years for century challenges (100 km+). Riders under 18 must submit written guardian consent at registration. All bicycle types (road, hybrid, MTB, gravel, city) are welcome.'
  },
  {
    number: '07',
    title: 'DIGITAL BIB & REGISTRATION',
    body: 'Registration fees grant a personal digital bib (public reference), route GPX, hydration support, SAG escort access, and a digital finisher e-certificate. Bib numbers are personal and non-transferable without written organizer approval. Arrive 30 minutes before flag-off to collect your physical bib plate.'
  },
  {
    number: '08',
    title: 'CANCELLATION & REFUND POLICY',
    body: 'Cancellations made more than 7 days before the event: 80% refund. Cancellations made 3–7 days before: 50% refund. Cancellations made within 48 hours: no refund. If the club cancels an event due to weather, public emergency, or force majeure, a full credit or refund will be issued within 7 business days. Payments are processed securely via Razorpay (RBI Compliant).'
  },
  {
    number: '09',
    title: 'MEDICAL & EMERGENCY PROTOCOL',
    body: 'Open-road cycling carries inherent risks. By registering, you confirm you are medically fit for the distance. A First Aid team and doctor on call are present at all events. In an emergency, notify the nearest Route Marshal or call the Rider Helpline immediately. Carry a valid photo ID and emergency contact details at all times during the ride.'
  },
  {
    number: '10',
    title: 'CODE OF CONDUCT',
    body: 'The Anand Cycling Club is a community of mutual respect. Verbal abuse, harassment, or discrimination of any kind will result in immediate removal from the event and permanent ban from the club. Be kind to fellow riders, volunteers, marshals, and locals along the route.'
  },
  {
    number: '11',
    title: 'PHOTOGRAPHY & MEDIA',
    body: 'By participating in any club event, you grant THE ANAND CYCLING CLUB a non-exclusive, royalty-free license to use photographs and videos taken during the event for promotional and social media purposes. If you wish to opt out, notify the organizer in writing before the event.'
  },
  {
    number: '12',
    title: 'PRIVACY POLICY',
    body: 'Your personal data (name, mobile, email, bicycle details) is collected solely for event management, digital bib allocation, and club communications. We do not sell or share your data with third parties. Payment data is handled entirely by Razorpay — we do not store card or banking details. You may request deletion of your data by emailing the club.'
  },
  {
    number: '13',
    title: 'ACCEPTANCE & AMENDMENTS',
    body: 'By registering for any event or creating a rider profile, you accept these rules in full. The Anand Cycling Club reserves the right to amend this Rule Book at any time. Updated rules will be published on this page. Continued participation constitutes acceptance of the revised rules.'
  },
];

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F2]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28">

        {/* Back nav */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#62645C] hover:text-[#171914] mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAEDE2] border border-[#E5E6DE] text-[#3F6212] text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official Club Document</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#171914] leading-[0.95]">
            THE<br />
            <span className="text-[#8B8D83]">RULE BOOK.</span>
          </h1>
          <p className="text-sm text-[#62645C] font-medium max-w-2xl leading-relaxed">
            Every rider in {CLUB_NAME} rides under these 13 rules. Safety, respect, and community are non-negotiable. Read before you ride.
          </p>
          <p className="text-[11px] font-mono text-[#8B8D83]">
            Last updated: October 2026 • Effective for all {CLUB_NAME} events
          </p>
        </div>

        {/* Rules Grid */}
        <div className="space-y-4">
          {RULES.map((rule) => (
            <div
              key={rule.number}
              className="group flex gap-5 sm:gap-8 p-6 sm:p-8 rounded-2xl border border-[#E5E6DE] bg-white hover:border-[#8cc427] hover:shadow-md transition-all duration-200"
            >
              <div className="shrink-0 pt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-[#EAEDE2] font-mono group-hover:text-[#C7F36B] transition-colors duration-200">
                  {rule.number}
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#171914] font-mono">
                  {rule.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#62645C] leading-relaxed font-medium">
                  {rule.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Footer */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#EAEDE2] border border-[#E5E6DE]">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#3F6212] font-mono mb-3">
            Questions about these rules?
          </h3>
          <div className="text-xs font-mono text-[#171914] space-y-1">
            <p><strong>{CLUB_NAME}</strong></p>
            <p>{CLUB_LOCATION}</p>
            <p>
              Email:{' '}
              <a href={`mailto:${CLUB_CONTACT_EMAIL}`} className="underline hover:text-[#3F6212]">
                {CLUB_CONTACT_EMAIL}
              </a>
            </p>
            <p>
              Rider Helpline:{' '}
              <a href={`tel:${CLUB_CONTACT_PHONE}`} className="underline hover:text-[#3F6212]">
                {CLUB_CONTACT_PHONE}
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

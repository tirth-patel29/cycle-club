import React from 'react';
import Link from 'next/link';
import { CLUB_NAME, CLUB_CONTACT_EMAIL, CLUB_CONTACT_PHONE, CLUB_LOCATION } from '@/lib/constants';
import { RefreshCw, ChevronLeft } from 'lucide-react';

export const metadata = {
  title: `Cancellation & Refund Policy • ${CLUB_NAME}`,
  description: `Official event cancellation, rescheduling, bib transfer, and refund rules for ${CLUB_NAME}.`,
};

export default function RefundPolicyPage() {
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
          FINANCIAL TRANSPARENCY
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#171914]">
          Cancellation & Refund Policy
        </h1>
        <p className="text-xs text-[#62645C] mt-2 font-mono">
          Last updated: October 2026 • Effective for all events organized by {CLUB_NAME}
        </p>
      </div>

      <div className="surface-card p-6 sm:p-10 rounded-3xl border border-[#E5E6DE] space-y-8 text-sm leading-relaxed text-[#62645C]">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            1. Event Cancellation by Organizers
          </h2>
          <p>
            If a scheduled cycling event is cancelled entirely by <strong>{CLUB_NAME}</strong> due to unforeseen administrative causes, municipal route restrictions, or extreme weather warnings:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Registered riders will be offered a <strong>100% full refund</strong> of their registration fee, OR</li>
            <li>A complimentary entry rollover to the rescheduled date or subsequent club stage of equal value.</li>
            <li>Eligible refunds are processed directly through Razorpay back to the original source account (UPI / Bank / Card) within <strong>5–7 business days</strong>.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            2. Participant Voluntary Cancellation
          </h2>
          <p>
            Because event logistical allocations (custom finisher medals, jerseys, breakfast catering, SAG fuel, and ambulance coverage) are committed well in advance based on registration headcount:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Cancellation 7+ days prior to flag-off:</strong> Eligible for a 70% refund of the entry fee (30% retained for administrative and bib processing costs).</li>
            <li><strong>Cancellation within 7 days of flag-off:</strong> Non-refundable due to locked vendor commitments and allocated custom merchandise.</li>
            <li><strong>No-Shows on Event Morning:</strong> Non-refundable and non-transferable.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            3. Bib Transfers to Another Rider
          </h2>
          <p>
            If you are unable to ride, you may transfer your bib to another eligible club cyclist up to <strong>72 hours before the event flag-off</strong>. To initiate a transfer, write to <strong>{CLUB_CONTACT_EMAIL}</strong> with your Bib Reference (e.g., <code>ACC-2026-XXXX</code>) and the full details of the replacement rider.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            4. Failed or Deducted Transactions
          </h2>
          <p>
            If an amount is debited from your bank account or UPI app but the registration page did not generate your confirmed pass:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Click the <strong>CHECK STATUS</strong> button on your payment screen to trigger immediate server reconciliation with Razorpay.</li>
            <li>If Razorpay flagged the payment as failed, the funds will be automatically reversed to your bank by the banking switch within <strong>5–7 business days</strong> as per RBI guidelines.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            5. Help Desk
          </h2>
          <p>
            For assistance with refunds, cancellations, or transaction verifications, contact our finance desk:
          </p>
          <div className="p-4 bg-[#F7F7F2] rounded-xl border border-[#E5E6DE] text-xs font-mono text-[#171914] space-y-1">
            <p><strong>{CLUB_NAME} • Accounts & Refunds</strong></p>
            <p>Email: <a href={`mailto:${CLUB_CONTACT_EMAIL}`} className="underline hover:text-[#3F6212]">{CLUB_CONTACT_EMAIL}</a></p>
            <p>Helpline: <a href={`tel:${CLUB_CONTACT_PHONE}`} className="underline hover:text-[#3F6212]">{CLUB_CONTACT_PHONE}</a></p>
            <p>Location: {CLUB_LOCATION}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { CLUB_NAME, CLUB_CONTACT_EMAIL, CLUB_CONTACT_PHONE, CLUB_LOCATION } from '@/lib/constants';
import { Shield, ChevronLeft } from 'lucide-react';

export const metadata = {
  title: `Privacy Policy • ${CLUB_NAME}`,
  description: `How ${CLUB_NAME} collects, protects, and handles rider information in compliance with Indian data practices.`,
};

export default function PrivacyPage() {
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
          DATA PROTECTION & PRIVACY
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#171914]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#62645C] mt-2 font-mono">
          Last updated: October 2026 • Effective for all riders of {CLUB_NAME}
        </p>
      </div>

      <div className="surface-card p-6 sm:p-10 rounded-3xl border border-[#E5E6DE] space-y-8 text-sm leading-relaxed text-[#62645C]">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            1. Information We Collect
          </h2>
          <p>
            To provide safe route logistics, timing telemetry, and digital bib passes, <strong>{CLUB_NAME}</strong> collects the following personal data when you register:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Rider Identity:</strong> Full Name, Age, Gender, and Email Address.</li>
            <li><strong>Safety & Emergency Contacts:</strong> 10-digit Indian Mobile Number, Emergency Contact Name, and Emergency Contact Phone Number.</li>
            <li><strong>Cycling Profile:</strong> Bicycle Category (Road, Gravel, Hybrid, MTB, City), Bicycle Brand/Model, and Jersey/T-Shirt size.</li>
            <li><strong>Transaction Identifiers:</strong> Razorpay order ID, payment reference ID, and payment timestamp (never card or UPI PINs).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            2. How Your Information Is Used
          </h2>
          <p>We use your information strictly for cycling club operations:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Allocating your unique digital Bib Reference and route timing checkpoints.</li>
            <li>Coordinating emergency assistance through our SAG rescue vehicles and marshals.</li>
            <li>Delivering entry confirmation passes, route GPX files, and finisher certificates via Resend email service.</li>
            <li>Reconciling and verifying payment status with our official payment gateway provider, Razorpay.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            3. Payment Processing & Banking Security
          </h2>
          <p>
            All monetary transactions on our platform are processed securely via <strong>Razorpay Software Private Limited</strong>, an RBI-authorized, PCI-DSS Level 1 certified payment aggregator.
          </p>
          <p className="text-xs sm:text-sm">
            <strong>{CLUB_NAME} does NOT store, handle, or transmit your debit/credit card numbers, CVVs, netbanking passwords, or UPI PINs.</strong> All payment credentials are encrypted directly inside Razorpay’s secure 256-bit environment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            4. Third-Party Service Providers
          </h2>
          <p>
            We partner only with vetted, high-integrity technology providers:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Neon Database Inc.:</strong> Encrypted PostgreSQL cloud storage hosted in ISO 27001-certified data centers.</li>
            <li><strong>Resend Inc.:</strong> Transactional email infrastructure for sending entry confirmations and event notifications.</li>
            <li><strong>Razorpay:</strong> Secure payment processing and webhook reconciliation.</li>
          </ul>
          <p>We will never sell, rent, or trade your personal information to third-party marketing agencies.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            5. Data Retention & Your Rights
          </h2>
          <p>
            We retain registration details for timing verification and finisher records. You may request to review, update, or delete your rider profile at any time by contacting our rider support desk.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black uppercase text-[#171914] tracking-wide">
            6. Privacy Inquiries
          </h2>
          <p>
            If you have questions regarding data handling or privacy, please reach out to:
          </p>
          <div className="p-4 bg-[#F7F7F2] rounded-xl border border-[#E5E6DE] text-xs font-mono text-[#171914] space-y-1">
            <p><strong>{CLUB_NAME} • Privacy & Compliance</strong></p>
            <p>Email: <a href={`mailto:${CLUB_CONTACT_EMAIL}`} className="underline hover:text-[#3F6212]">{CLUB_CONTACT_EMAIL}</a></p>
            <p>Location: {CLUB_LOCATION}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Registration, CyclingEvent, Payment } from '@/types';
import { formatINR, formatDateIndian, formatTimeIndian, CLUB_NAME } from '@/lib/constants';
import { CheckCircle2, QrCode, Bike, Printer, ArrowRight, AlertCircle, MapPin } from 'lucide-react';

interface Props {
  registration: Registration;
  event: CyclingEvent;
  payment?: Payment | null;
}

export function ConfirmationPassView({ registration, event, payment }: Props) {
  const isConfirmed = registration.status === 'confirmed';

  useEffect(() => {
    if (isConfirmed) {
      try {
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
    } else {
      // Auto-check if payment was captured in the background
      fetch('/api/payments/razorpay/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_reference: registration.public_reference })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'confirmed') {
            window.location.reload();
          }
        })
        .catch(() => {});
    }
  }, [isConfirmed, registration.public_reference]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Status Notice */}
      {isConfirmed ? (
        <div className="bg-[#EAEDE2] border border-[#d2d7c5] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#171914] animate-pulse"></span>
            <span className="text-[#171914] uppercase tracking-wider font-extrabold">
              Entry Verified • Official Rider Pass
            </span>
          </div>

          <button
            onClick={handlePrint}
            className="btn-glossy-lime px-4 py-2 rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 print:hidden cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT PASS</span>
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 text-xs font-semibold">
          <span className="text-amber-800 uppercase font-bold">
            Payment Pending For This Entry
          </span>
          <Link
            href={`/registrations/${registration.public_reference}/pay`}
            className="btn-glossy-lime px-5 py-2 rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5"
          >
            <span>COMPLETE PAYMENT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* THE OFFICIAL RIDER BIB PASS */}
      <div className="surface-card rounded-3xl border border-[#E5E6DE] overflow-hidden shadow-xl print:border-black print:bg-white print:text-black">
        {/* Pass Top Ribbon */}
        <div className="bg-[#171914] p-6 sm:p-8 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-0.5 shadow-sm overflow-hidden">
              <img
                src="/logo.webp"
                alt="THE ANAND CYCLING CLUB Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-black text-xl text-white uppercase tracking-tight">
                {CLUB_NAME}
              </span>
              <p className="text-[10px] text-[#C7F36B] uppercase tracking-widest font-extrabold">
                OFFICIAL PARTICIPANT BIB PASS
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-white/60 uppercase block tracking-widest font-mono">REFERENCE</span>
            <span className="text-xl sm:text-2xl font-black text-[#C7F36B] tracking-widest font-mono">
              {registration.public_reference}
            </span>
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-6 sm:p-10 space-y-8 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#E5E6DE]">
            <div className="space-y-1">
              <span className="text-[11px] uppercase text-[#62645C] block font-semibold tracking-wider">REGISTERED RIDER</span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#171914] tracking-tight">
                {registration.full_name}
              </h2>
              <p className="text-xs text-[#62645C]">
                Age: {registration.age} • Gender: {registration.gender} • Mobile: +91 {registration.mobile_number}
              </p>
              <p className="text-xs font-mono text-[#171914] font-bold mt-1">
                Bicycle: <span className="bg-[#EAEDE2] px-2 py-0.5 rounded text-[#171914]">{registration.bicycle_type || 'Road'}</span> {registration.bicycle_brand ? `(${registration.bicycle_brand} ${registration.bicycle_model || ''})` : ''} • Jersey: {registration.jersey_size || 'None'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] flex items-center gap-4 shrink-0">
              <QrCode className="w-14 h-14 text-[#171914]" />
              <div className="text-[11px] space-y-0.5">
                <span className="font-bold text-[#171914] block">BIB SCAN CODE</span>
                <span className="text-[#62645C] text-[10px] block font-mono">{registration.public_reference}</span>
                <span className="text-[#171914] font-black text-[10px] uppercase bg-[#C7F36B] px-1.5 py-0.5 rounded">
                  {isConfirmed ? '✓ CONFIRMED' : 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Event Specs */}
          <div className="space-y-4 text-xs font-semibold">
            <div className="space-y-0.5">
              <span className="text-[11px] uppercase text-[#62645C] tracking-wider">OFFICIAL STAGE EVENT</span>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-[#171914]">
                {event.title}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl">
                <span className="text-[10px] text-[#62645C] uppercase block tracking-wider">DISTANCE</span>
                <span className="text-base font-black text-[#171914]">{event.distance_km} KM</span>
              </div>
              <div className="p-3 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl">
                <span className="text-[10px] text-[#62645C] uppercase block tracking-wider">DATE</span>
                <span className="text-xs font-bold text-[#171914]">{formatDateIndian(event.starts_at)}</span>
              </div>
              <div className="p-3 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl">
                <span className="text-[10px] text-[#62645C] uppercase block tracking-wider">FLAG-OFF</span>
                <span className="text-xs font-bold text-[#171914]">{formatTimeIndian(event.starts_at)}</span>
              </div>
              <div className="p-3 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl">
                <span className="text-[10px] text-[#62645C] uppercase block tracking-wider">REPORTING</span>
                <span className="text-xs font-bold text-[#171914]">{event.reporting_time || '05:30 AM'}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#171914] shrink-0" />
              <span className="text-[#171914]">START VENUE: {event.venue}</span>
            </div>
          </div>

          {/* Footer fee & verified badge */}
          <div className="pt-4 border-t border-[#E5E6DE] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-[#62645C]">REGISTRATION FEE: </span>
              <strong className="text-[#171914] font-extrabold">
                {registration.amount_due_paise === 0 ? 'FREE ENTRY (₹0)' : formatINR(registration.amount_due_paise)}
              </strong>
              {registration.amount_due_paise > 0 && payment && (
                <span className="ml-2 text-[#62645C] text-[10px] font-mono">
                  (DEMO TXN: {payment.provider_payment_reference})
                </span>
              )}
            </div>
            <span className="text-[#171914] font-black uppercase text-[10px] tracking-wider bg-[#EAEDE2] px-2.5 py-1 rounded-full border border-[#E5E6DE]">
              OFFICIAL ANAND CYCLING CLUB DIGITAL PASS
            </span>
          </div>
        </div>

        {/* Morning Instructions */}
        <div className="bg-[#EAEDE2] p-6 border-t border-[#E5E6DE] text-xs text-[#171914] space-y-1.5 uppercase font-semibold">
          <p>• HELMET IS STRICTLY MANDATORY FOR START LINE ENTRY.</p>
          <p>• REPORT 30 MINS PRIOR TO FLAG-OFF TO COLLECT PHYSICAL BIKE BIB.</p>
          <p>• HOT MASALA CHAI & GUJARATI BREAKFAST AWAITS AT THE FINISH ARCH.</p>
        </div>
      </div>
    </div>
  );
}

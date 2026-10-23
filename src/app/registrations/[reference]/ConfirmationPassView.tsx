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
    }
  }, [isConfirmed]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Status Notice */}
      {isConfirmed ? (
        <div className="glass-panel border-2 border-[#557b12] dark:border-[#b8f04c]/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#557b12] dark:bg-[#b8f04c] animate-pulse"></span>
            <span className="event-heading uppercase tracking-wide">
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
        <div className="glass-panel border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 text-xs font-semibold">
          <span className="text-amber-600 dark:text-amber-300 uppercase font-bold">
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
      <div className="glass-panel rounded-3xl border-2 border-black/10 dark:border-white/20 overflow-hidden shadow-2xl print:border-black print:bg-white print:text-black">
        {/* Pass Top Ribbon */}
        <div className="bg-[#11160f] p-6 sm:p-8 flex items-center justify-between border-b border-white/10 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#b8f04c] text-[#0c1204] flex items-center justify-center font-bold">
              <Bike className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-xl text-white uppercase tracking-tight">
                {CLUB_NAME}
              </span>
              <p className="text-[10px] text-[#b8f04c] uppercase tracking-widest font-extrabold">
                OFFICIAL PARTICIPANT BIB PASS
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-white/50 uppercase block tracking-widest">REFERENCE</span>
            <span className="text-xl sm:text-2xl font-black text-[#b8f04c] tracking-widest">
              {registration.public_reference}
            </span>
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-6 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-black/10 dark:border-white/10">
            <div className="space-y-1">
              <span className="text-[11px] uppercase opacity-60 block font-semibold">REGISTERED RIDER</span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase event-heading tracking-tight">
                {registration.full_name}
              </h2>
              <p className="text-xs event-body">
                Age: {registration.age} • Gender: {registration.gender} • Mobile: +91 {registration.mobile_number}
              </p>
            </div>

            <div className="event-venue-box p-4 rounded-2xl flex items-center gap-4 shrink-0">
              <QrCode className="w-14 h-14 text-slate-900 dark:text-white" />
              <div className="text-[11px] space-y-0.5">
                <span className="font-bold event-heading block">BIB SCAN CODE</span>
                <span className="opacity-60 text-[10px] block font-mono">{registration.public_reference}</span>
                <span className="text-[#4d710d] dark:text-[#b8f04c] font-black text-[10px] uppercase">
                  {isConfirmed ? '✓ CONFIRMED' : 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Event Specs */}
          <div className="space-y-4 text-xs font-semibold">
            <div className="space-y-0.5">
              <span className="text-[11px] uppercase opacity-60">OFFICIAL EVENT</span>
              <h3 className="text-xl sm:text-2xl font-black uppercase event-heading">
                {event.title}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 event-venue-box rounded-xl">
                <span className="text-[10px] opacity-60 uppercase block">DISTANCE</span>
                <span className="text-base font-black event-heading">{event.distance_km} KM</span>
              </div>
              <div className="p-3 event-venue-box rounded-xl">
                <span className="text-[10px] opacity-60 uppercase block">DATE</span>
                <span className="text-xs font-bold event-heading">{formatDateIndian(event.starts_at)}</span>
              </div>
              <div className="p-3 event-venue-box rounded-xl">
                <span className="text-[10px] opacity-60 uppercase block">FLAG-OFF</span>
                <span className="text-xs font-bold event-heading">{formatTimeIndian(event.starts_at)}</span>
              </div>
              <div className="p-3 event-venue-box rounded-xl">
                <span className="text-[10px] opacity-60 uppercase block">REPORTING</span>
                <span className="text-xs font-bold text-[#4d710d] dark:text-[#b8f04c]">{event.reporting_time || '05:30 AM'}</span>
              </div>
            </div>

            <div className="p-3.5 event-venue-box rounded-xl flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#4d710d] dark:text-[#b8f04c] shrink-0" />
              <span className="event-body">START VENUE: {event.venue}</span>
            </div>
          </div>

          {/* Footer fee & verified badge */}
          <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="opacity-60">FEE PAID: </span>
              <strong className="event-heading font-extrabold">{formatINR(registration.amount_due_paise)}</strong>
              {payment && (
                <span className="ml-2 opacity-50 text-[10px] font-mono">
                  (TXN: {payment.provider_payment_reference})
                </span>
              )}
            </div>
            <span className="text-[#4d710d] dark:text-[#b8f04c] font-black uppercase text-[10px] tracking-wider">
              OFFICIAL ANAND CYCLING CLUB DIGITAL PASS
            </span>
          </div>
        </div>

        {/* Morning Instructions */}
        <div className="bg-[#f0f4ea] dark:bg-[#0c0e0b] p-6 border-t border-black/10 dark:border-white/10 text-xs text-slate-700 dark:text-white/60 space-y-1.5 uppercase font-semibold">
          <p>• HELMET IS STRICTLY MANDATORY FOR START LINE ENTRY.</p>
          <p>• REPORT 30 MINS PRIOR TO FLAG-OFF TO COLLECT PHYSICAL BIKE BIB.</p>
          <p>• HOT MASALA CHAI & GUJARATI BREAKFAST AWAITS AT THE FINISH ARCH.</p>
        </div>
      </div>
    </div>
  );
}

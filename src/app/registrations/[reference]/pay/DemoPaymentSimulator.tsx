'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Registration, CyclingEvent } from '@/types';
import { formatINR } from '@/lib/constants';
import { QrCode, CreditCard, Smartphone, CheckCircle2, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  registration: Registration;
  event: CyclingEvent;
}

export function DemoPaymentSimulator({ registration, event }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card'>('upi');

  const handleSimulatePayment = async (outcome: 'success' | 'failure') => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/payments/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_reference: registration.public_reference,
          outcome,
          payment_method: selectedMethod === 'upi' ? 'upi_qr' : 'card'
        })
      });

      const data = await response.json();

      if (outcome === 'success') {
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Payment simulation failed');
        }
        router.push(`/registrations/${registration.public_reference}`);
      } else {
        setErrorMessage(data.error || 'Simulated transaction was declined.');
        setLoading(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Simulation error.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Warning Banner */}
      <div className="bg-[#EAEDE2] border border-[#d2d7c5] rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 text-[#171914] text-xs font-semibold">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="uppercase text-[11px] leading-relaxed">
          <strong className="text-amber-800">DEMO CHECKOUT ACTIVE:</strong> Simulated gateway environment. No actual bank or UPI account will be charged.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Summary Card */}
      <div className="surface-card rounded-2xl border border-[#E5E6DE] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E6DE]">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#62645C] block font-semibold">BIB REFERENCE</span>
            <p className="text-2xl font-black text-[#171914] tracking-wider font-mono">
              {registration.public_reference}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-[#62645C] block font-semibold">TOTAL REGISTRATION FEE</span>
            <p className="text-3xl sm:text-4xl font-black text-[#171914]">
              {formatINR(registration.amount_due_paise)}
            </p>
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl">
            <span className="text-[#62645C] uppercase block text-[10px] font-semibold tracking-wider">RIDER NAME</span>
            <p className="font-bold text-[#171914] text-sm mt-0.5">{registration.full_name}</p>
          </div>
          <div className="p-3.5 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl">
            <span className="text-[#62645C] uppercase block text-[10px] font-semibold tracking-wider">STAGE EVENT</span>
            <p className="font-bold text-[#171914] text-sm mt-0.5 truncate">{event.title}</p>
          </div>
        </div>
      </div>

      {/* Mode selection */}
      <div className="surface-card rounded-2xl border border-[#E5E6DE] p-6 sm:p-8 space-y-6">
        <span className="text-xs uppercase text-[#171914] font-black tracking-wider block">
          SELECT SIMULATED GATEWAY METHOD
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedMethod('upi')}
            className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              selectedMethod === 'upi'
                ? 'border-[#171914] bg-[#EAEDE2] text-[#171914] shadow-xs'
                : 'border-[#E5E6DE] bg-white text-[#62645C] hover:border-[#171914]/40 hover:text-[#171914]'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${selectedMethod === 'upi' ? 'bg-[#171914] text-[#C7F36B]' : 'bg-[#F7F7F2] text-[#171914]'}`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold uppercase text-[#171914]">SIMULATED UPI / QR</p>
              <p className="text-[10px] text-[#62645C]">Instant mock UPI scanner</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              selectedMethod === 'card'
                ? 'border-[#171914] bg-[#EAEDE2] text-[#171914] shadow-xs'
                : 'border-[#E5E6DE] bg-white text-[#62645C] hover:border-[#171914]/40 hover:text-[#171914]'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${selectedMethod === 'card' ? 'bg-[#171914] text-[#C7F36B]' : 'bg-[#F7F7F2] text-[#171914]'}`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold uppercase text-[#171914]">SIMULATED CARD / NETBANKING</p>
              <p className="text-[10px] text-[#62645C]">Mock RuPay, Visa, SBI netbanking</p>
            </div>
          </button>
        </div>

        {selectedMethod === 'upi' && (
          <div className="p-6 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] text-center space-y-3 max-w-xs mx-auto">
            <div className="w-36 h-36 mx-auto bg-white p-3 rounded-xl flex items-center justify-center border border-[#E5E6DE] shadow-xs">
              <QrCode className="w-28 h-28 text-[#171914]" />
            </div>
            <p className="text-xs font-mono font-semibold uppercase text-[#171914]">
              MOCK VPA: <span className="font-black">anandcycling@demo</span>
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons: GLOSSY BUTTONS PRESERVED */}
      <div className="surface-card rounded-2xl border border-[#E5E6DE] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSimulatePayment('failure')}
          className="btn-glossy-dark w-full sm:w-auto px-6 py-3.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>SIMULATE DECLINE</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleSimulatePayment('success')}
          className="btn-glossy-lime w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>CONFIRMING PASS...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>SIMULATE PAYMENT SUCCESS</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

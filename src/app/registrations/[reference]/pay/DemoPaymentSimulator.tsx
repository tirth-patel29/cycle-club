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
      <div className="glass-panel border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 text-amber-800 dark:text-amber-300 text-xs font-semibold">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="uppercase">
          <strong className="text-amber-900 dark:text-amber-200">DEMO CHECKOUT ACTIVE:</strong> Simulated gateway. No real money or bank account will be charged.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-500 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Summary Card */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
          <div>
            <span className="text-[11px] uppercase opacity-60 block font-semibold">BIB REFERENCE</span>
            <p className="text-2xl font-black text-[#4d710d] dark:text-[#b8f04c] tracking-wider font-mono">
              {registration.public_reference}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] uppercase opacity-60 block font-semibold">AMOUNT DUE</span>
            <p className="text-3xl sm:text-4xl font-black event-heading">
              {formatINR(registration.amount_due_paise)}
            </p>
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 event-venue-box rounded-xl">
            <span className="opacity-60 uppercase block text-[10px] font-semibold">RIDER</span>
            <p className="font-bold event-heading text-sm">{registration.full_name}</p>
          </div>
          <div className="p-3.5 event-venue-box rounded-xl">
            <span className="opacity-60 uppercase block text-[10px] font-semibold">EVENT</span>
            <p className="font-bold event-heading text-sm truncate">{event.title}</p>
          </div>
        </div>
      </div>

      {/* Mode selection */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
        <span className="text-xs uppercase text-[#4d710d] dark:text-[#b8f04c] font-black tracking-wider block">
          SELECT SIMULATED GATEWAY
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedMethod('upi')}
            className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
              selectedMethod === 'upi'
                ? 'border-[#4d710d] bg-[#4d710d]/10 text-slate-900 dark:border-[#b8f04c] dark:bg-[#b8f04c]/10 dark:text-white'
                : 'border-black/10 text-slate-600 hover:border-black/20 dark:border-white/10 dark:text-white/60 dark:hover:border-white/20'
            }`}
          >
            <Smartphone className="w-5 h-5 text-[#4d710d] dark:text-[#b8f04c]" />
            <div>
              <p className="font-bold uppercase event-heading">SIMULATED UPI / QR</p>
              <p className="text-[10px] opacity-60">GPay, PhonePe, Paytm</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
              selectedMethod === 'card'
                ? 'border-[#4d710d] bg-[#4d710d]/10 text-slate-900 dark:border-[#b8f04c] dark:bg-[#b8f04c]/10 dark:text-white'
                : 'border-black/10 text-slate-600 hover:border-black/20 dark:border-white/10 dark:text-white/60 dark:hover:border-white/20'
            }`}
          >
            <CreditCard className="w-5 h-5 text-[#4d710d] dark:text-[#b8f04c]" />
            <div>
              <p className="font-bold uppercase event-heading">SIMULATED CARD / NETBANKING</p>
              <p className="text-[10px] opacity-60">RuPay, Visa, SBI, HDFC</p>
            </div>
          </button>
        </div>

        {selectedMethod === 'upi' && (
          <div className="p-6 rounded-2xl bg-[#f0f4ea] dark:bg-black/50 border border-black/10 dark:border-white/10 text-center space-y-3 max-w-xs mx-auto shadow-sm">
            <div className="w-36 h-36 mx-auto bg-white p-3 rounded-xl flex items-center justify-center border border-black/5 shadow-sm">
              <QrCode className="w-28 h-28 text-black" />
            </div>
            <p className="text-xs event-body font-mono font-semibold uppercase">
              UPI: <span className="text-[#4d710d] dark:text-[#b8f04c]">anandcycling@demo</span>
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons: FULLY GLOSSY BUTTONS */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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

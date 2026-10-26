'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Registration, CyclingEvent } from '@/types';
import { formatINR } from '@/lib/constants';
import { ShieldCheck, CheckCircle2, AlertTriangle, Loader2, CreditCard, Smartphone, Building2, RefreshCw } from 'lucide-react';

interface Props {
  registration: Registration;
  event: CyclingEvent;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function RazorpayCheckoutClient({ registration, event }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingSync, setCheckingSync] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const razorpayInstanceRef = useRef<any>(null);

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const syncPaymentStatus = async (silent: boolean = false): Promise<boolean> => {
    if (!silent) setCheckingSync(true);
    try {
      const res = await fetch('/api/payments/razorpay/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_reference: registration.public_reference
        })
      });

      const data = await res.json();
      if (data.status === 'confirmed') {
        stopPolling();
        try {
          if (razorpayInstanceRef.current?.close) {
            razorpayInstanceRef.current.close();
          }
        } catch {
          // ignore
        }
        router.push(`/registrations/${registration.public_reference}?payment=success`);
        return true;
      }
      return false;
    } catch (err) {
      if (!silent) {
        console.error('[Razorpay Sync check error]:', err);
      }
      return false;
    } finally {
      if (!silent) setCheckingSync(false);
    }
  };

  const startBackgroundPolling = () => {
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      const isConfirmed = await syncPaymentStatus(true);
      if (isConfirmed) {
        stopPolling();
      }
    }, 3500);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      // 1. Ensure official Razorpay SDK is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway. Please check your internet connection and try again.');
      }

      // 2. Request server to create authoritative order
      const orderRes = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_reference: registration.public_reference
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize payment order with server.');
      }

      if (orderData.already_confirmed) {
        router.push(`/registrations/${registration.public_reference}`);
        return;
      }

      // 3. Configure Razorpay modal options
      const options = {
        key: orderData.key_id,
        amount: orderData.amount_paise,
        currency: orderData.currency || 'INR',
        name: 'Anand Cycling Club',
        description: `Entry Pass: ${event.title}`,
        order_id: orderData.order_id,
        prefill: {
          name: orderData.rider_name || registration.full_name,
          email: orderData.rider_email || registration.email || '',
          contact: orderData.rider_phone || registration.mobile_number
        },
        theme: {
          color: '#171914'
        },
        modal: {
          ondismiss: async () => {
            stopPolling();
            setLoading(false);
            // Check if user actually completed UPI payment on their mobile app before closing modal
            setCheckingSync(true);
            const confirmed = await syncPaymentStatus(true);
            setCheckingSync(false);

            if (!confirmed) {
              setInfoMessage(
                'Payment window closed. If you already completed the payment via UPI, click "Check Payment Status" below to verify.'
              );
            }
          }
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          stopPolling();
          try {
            setLoading(true);
            setErrorMessage(null);

            // 4. Send signature to server for cryptographic HMAC-SHA256 verification
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                registration_reference: registration.public_reference,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            // 5. Verified successfully: redirect to rider pass
            router.push(`/registrations/${registration.public_reference}?payment=success`);
          } catch (verifyErr: unknown) {
            const msg = verifyErr instanceof Error ? verifyErr.message : 'Failed to verify payment.';
            setErrorMessage(msg);
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpayInstanceRef.current = razorpay;

      razorpay.on('payment.failed', function (resp: any) {
        console.error('Razorpay payment failed:', resp.error);
        stopPolling();
        setErrorMessage(
          resp.error?.description || 'Your payment could not be processed by your bank or UPI provider.'
        );
        setLoading(false);
      });

      razorpay.open();
      // Start background polling while modal is visible (detects mobile UPI QR scans immediately)
      startBackgroundPolling();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
      setLoading(false);
      stopPolling();
    }
  };

  const handleManualSync = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    const confirmed = await syncPaymentStatus(false);
    if (!confirmed) {
      setInfoMessage(
        'Payment status is still pending confirmation from bank/UPI. If your account was debited, please wait 30-60 seconds and click Check Status again.'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Banner */}
      <div className="bg-[#EAEDE2] border border-[#d2d7c5] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3.5 text-[#171914] text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#3F6212] shrink-0" />
          <p className="uppercase text-[11px] font-semibold leading-relaxed">
            <strong className="text-[#3F6212]">OFFICIAL SECURE GATEWAY:</strong> 256-bit encrypted checkout powered by Razorpay. All Indian UPI apps, RuPay, cards, & Netbanking accepted.
          </p>
        </div>
        <div className="hidden sm:inline-flex px-2.5 py-1 rounded-md bg-[#C7F36B] text-[#171914] font-black text-[10px] tracking-wider uppercase shrink-0">
          RBI Compliant
        </div>
      </div>

      {infoMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2.5">
          <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
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
            <span className="text-[11px] uppercase tracking-wider text-[#62645C] block font-semibold">AMOUNT TO PAY</span>
            <p className="text-3xl sm:text-4xl font-black text-[#171914]">
              {formatINR(registration.amount_due_paise)}
            </p>
          </div>
        </div>

        {/* Specifications */}
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

        {/* Payment Methods Supported */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-mono text-[#62645C] uppercase font-bold tracking-wider block">
            ACCEPTED PAYMENT MODES
          </span>
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#F7F7F2] border border-[#E5E6DE] flex flex-col items-center gap-1">
              <Smartphone className="w-4 h-4 text-[#171914]" />
              <span className="text-[11px] font-bold text-[#171914]">UPI & QR</span>
              <span className="text-[9px] text-[#62645C]">GPay, PhonePe, Paytm</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F7F2] border border-[#E5E6DE] flex flex-col items-center gap-1">
              <CreditCard className="w-4 h-4 text-[#171914]" />
              <span className="text-[11px] font-bold text-[#171914]">Cards</span>
              <span className="text-[9px] text-[#62645C]">RuPay, Visa, MC</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F7F2] border border-[#E5E6DE] flex flex-col items-center gap-1">
              <Building2 className="w-4 h-4 text-[#171914]" />
              <span className="text-[11px] font-bold text-[#171914]">Netbanking</span>
              <span className="text-[9px] text-[#62645C]">All Indian Banks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="surface-card rounded-2xl border border-[#E5E6DE] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#62645C] font-medium text-center sm:text-left">
          Instant digital pass issued & sent via email immediately upon payment verification.
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={checkingSync || loading}
            onClick={handleManualSync}
            className="w-full sm:w-auto px-5 py-4 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-[#d2d7c5] bg-[#F7F7F2] hover:bg-[#EAEDE2] text-[#171914] cursor-pointer transition-colors disabled:opacity-50"
            title="Check if payment was captured"
          >
            {checkingSync ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#171914]" />
                <span>VERIFYING STATUS...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-[#171914]" />
                <span>CHECK STATUS</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={loading || checkingSync}
            onClick={handlePayNow}
            className="btn-glossy-lime w-full sm:w-auto px-8 py-4 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>GATEWAY ACTIVE...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>PROCEED TO PAY {formatINR(registration.amount_due_paise)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

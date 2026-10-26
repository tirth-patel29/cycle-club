import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getPaymentProviderName } from '@/lib/payments/config';
import { DemoPaymentSimulator } from './DemoPaymentSimulator';
import { RazorpayCheckoutClient } from './RazorpayCheckoutClient';
import { ChevronLeft, Lock } from 'lucide-react';

interface Props {
  params: Promise<{ reference: string }>;
}

export default async function DemoPaymentPage({ params }: Props) {
  const { reference } = await params;
  const registration = await db.getRegistrationByReference(reference);

  if (!registration) {
    notFound();
  }

  const event = await db.getEventById(registration.event_id);
  if (!event) {
    notFound();
  }

  // If already confirmed, redirect to confirmation pass
  if (registration.status === 'confirmed') {
    return (
      <div className="w-full bg-[#F7F7F2] min-h-screen pt-24 sm:pt-28 pb-20">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl font-black text-[#171914] uppercase">This registration is already confirmed!</h2>
          <p className="text-sm text-[#62645C]">You do not need to pay again. Your official digital pass is ready.</p>
          <Link
            href={`/registrations/${registration.public_reference}`}
            className="btn-glossy-lime inline-block px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider"
          >
            View Official Rider Pass
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F7F7F2] min-h-screen pt-24 sm:pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#62645C] hover:text-[#171914] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Cancel & Return</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#62645C]">
            <Lock className="w-3.5 h-3.5 text-[#3F6212]" />
            <span>256-bit Encrypted Checkout</span>
          </div>
        </div>

        {getPaymentProviderName() === 'razorpay' ? (
          <RazorpayCheckoutClient registration={registration} event={event} />
        ) : (
          <DemoPaymentSimulator registration={registration} event={event} />
        )}
      </div>
    </div>
  );
}

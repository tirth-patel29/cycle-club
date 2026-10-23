import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { DemoPaymentSimulator } from './DemoPaymentSimulator';
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
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900">This registration is already confirmed!</h2>
        <p className="text-slate-600">You do not need to pay again.</p>
        <Link
          href={`/registrations/${registration.public_reference}`}
          className="inline-block bg-slate-950 text-lime-400 font-bold px-6 py-3 rounded-xl"
        >
          View Official Rider Pass
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-950 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Cancel & Return</span>
        </Link>

        <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>128-bit Encrypted Session</span>
        </div>
      </div>

      <DemoPaymentSimulator registration={registration} event={event} />
    </div>
  );
}

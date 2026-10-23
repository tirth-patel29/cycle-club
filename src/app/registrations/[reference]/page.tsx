import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ConfirmationPassView } from './ConfirmationPassView';
import { ChevronLeft } from 'lucide-react';

interface Props {
  params: Promise<{ reference: string }>;
}

export default async function RegistrationDetailPage({ params }: Props) {
  const { reference } = await params;
  const registration = await db.getRegistrationByReference(reference);

  if (!registration) {
    notFound();
  }

  const event = await db.getEventById(registration.event_id);
  if (!event) {
    notFound();
  }

  const payment = await db.getPaymentByRegistrationId(registration.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6">
      <div className="print:hidden">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-950 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Rides</span>
        </Link>
      </div>

      <ConfirmationPassView
        registration={registration}
        event={event}
        payment={payment}
      />
    </div>
  );
}

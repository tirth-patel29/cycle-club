import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { formatDateIndian } from '@/lib/constants';
import { RegistrationForm } from './RegistrationForm';
import { ChevronLeft, Calendar, MapPin } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EventRegisterPage({ params }: Props) {
  const { slug } = await params;
  const event = await db.getEventBySlug(slug);

  if (!event || event.status !== 'published') {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Event Details</span>
        </Link>
      </div>

      {/* Header with event snapshot */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border border-black/10 dark:border-white/10 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#b8f04c] text-[#0c1204] text-xs font-black px-3 py-1 rounded-md uppercase">
            {event.distance_km} KM
          </span>
          <span className="bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white text-xs font-bold px-3 py-1 rounded-md border border-black/10 dark:border-white/10">
            {event.difficulty}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight event-heading">
          Register: {event.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm event-body pt-2 border-t border-black/10 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#4d710d] dark:text-[#b8f04c]" />
            <span>{formatDateIndian(event.starts_at)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#4d710d] dark:text-[#b8f04c]" />
            <span>{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Registration Form Component */}
      <RegistrationForm event={event} />
    </div>
  );
}

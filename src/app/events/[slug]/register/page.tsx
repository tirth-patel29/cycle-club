import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { formatDateIndian } from '@/lib/constants';
import { getAuthUser, getAuthRiderProfile } from '@/lib/supabase/server';
import { RegistrationForm } from './RegistrationForm';
import { ChevronLeft, Calendar, MapPin, UserCheck } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EventRegisterPage({ params }: Props) {
  const { slug } = await params;
  const event = await db.getEventBySlug(slug);

  if (!event || event.status !== 'published') {
    notFound();
  }

  // Enforce rider authentication & redirect with returnUrl
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect(`/auth/login?returnUrl=/events/${event.slug}/register`);
  }

  const riderProfile = await getAuthRiderProfile();
  const isFree = event.registration_fee_paise === 0;

  return (
    <div className="w-full bg-[#F7F7F2] min-h-screen pt-24 sm:pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back button & User Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#62645C] hover:text-[#171914] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Event Details</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAEDE2] border border-[#E5E6DE] text-[#3F6212] font-mono text-xs font-bold w-fit">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Logged in as {riderProfile?.full_name || authUser.email}</span>
          </div>
        </div>

        {/* Header with event snapshot */}
        <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#C7F36B] text-[#171914] text-xs font-black px-3 py-1 rounded-md uppercase shadow-xs">
              {event.distance_km} KM
            </span>
            <span className="bg-[#EAEDE2] text-[#171914] text-xs font-bold px-3 py-1 rounded-md border border-[#E5E6DE]">
              {event.difficulty}
            </span>
            <span className="bg-[#C7F36B]/25 text-[#3F6212] text-xs font-black px-3 py-1 rounded-md uppercase border border-[#8cc427]">
              {isFree ? 'FREE EVENT' : `ENTRY: ₹${Math.round(event.registration_fee_paise / 100)}`}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#171914] font-sans">
            Register: {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#62645C] font-medium pt-2 border-t border-[#E5E6DE]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#3F6212]" />
              <span>{formatDateIndian(event.starts_at)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#3F6212]" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Registration Form Component with profile prefill */}
        <RegistrationForm
          event={event}
          initialProfile={riderProfile}
          userEmail={authUser.email || ''}
          userId={authUser.id}
        />
      </div>
    </div>
  );
}

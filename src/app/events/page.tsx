import React from 'react';
import { db } from '@/lib/db';
import { EventsFilterView } from '@/components/events/EventsFilterView';
import { CLUB_NAME } from '@/lib/constants';

export const revalidate = 0;

export default async function EventsCatalogPage() {
  const events = await db.getEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 space-y-8">
      {/* Page Header */}
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-[#3b5e08] dark:text-[#b8f04c] border border-slate-900/10 dark:border-white/15 text-xs font-bold uppercase tracking-wider shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#4a7209] dark:bg-[#b8f04c]" />
          <span>{CLUB_NAME} • EVENT SCHEDULE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-slate-950 dark:text-white tracking-tight leading-tight">
          Upcoming Rides & Brevets
        </h1>
        <p className="text-sm sm:text-base text-slate-700 dark:text-white/70 leading-relaxed font-medium">
          Choose your ride, review starting venues, and register online. Every event includes route marshals, backup vehicle, breakfast, and finisher medals.
        </p>
      </div>

      {/* Filterable Events List */}
      <EventsFilterView events={events} />
    </div>
  );
}

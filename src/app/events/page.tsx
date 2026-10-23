import React from 'react';
import { db } from '@/lib/db';
import { EventCard } from '@/components/events/EventCard';
import { Bike } from 'lucide-react';
import { CLUB_NAME } from '@/lib/constants';

export default async function EventsCatalogPage() {
  const events = await db.getEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 space-y-8">
      {/* Page Header */}
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#b8f04c] text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#b8f04c]" />
          <span>{CLUB_NAME} • EVENT SCHEDULE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-tight">
          Upcoming Rides & Brevets
        </h1>
        <p className="text-sm sm:text-base text-white/70 leading-relaxed font-medium">
          Choose your ride, review starting venues, and register online. Every event includes route marshals, backup vehicle, breakfast, and finisher medals.
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-20 glass-panel rounded-3xl border border-white/10 p-8 space-y-3 text-white/60">
          <Bike className="w-10 h-10 text-white/30 mx-auto" />
          <p className="text-sm font-semibold">No rides currently scheduled. Check back soon!</p>
        </div>
      )}
    </div>
  );
}

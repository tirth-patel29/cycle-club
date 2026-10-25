import React from 'react';
import { db } from '@/lib/db';
import { EventsFilterView } from '@/components/events/EventsFilterView';
import { CLUB_NAME } from '@/lib/constants';

export const revalidate = 0;

export default async function EventsCatalogPage() {
  const events = await db.getEvents();

  return (
    <div className="w-full bg-[#F7F7F2] min-h-screen pt-24 sm:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Editorial Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAEDE2] border border-[#E5E6DE] text-[#3F6212] text-xs font-bold uppercase tracking-wider shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#8cc427]" />
            <span>{CLUB_NAME} • EVENT CALENDAR</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase text-[#171914] tracking-tight leading-tight font-sans">
            Upcoming Rides & Brevets
          </h1>
          <p className="text-sm sm:text-base text-[#62645C] leading-relaxed font-medium">
            Choose your ride, review starting venues, and register online. Every event includes route marshals, backup SAG vehicle, hydration, breakfast, and finisher medals.
          </p>
        </div>

        {/* Filterable Events List */}
        <EventsFilterView events={events} />
      </div>
    </div>
  );
}

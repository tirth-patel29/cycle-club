'use client';

import { useState } from 'react';
import { CyclingEvent } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { Bike, Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface EventsFilterViewProps {
  events: CyclingEvent[];
}

export function EventsFilterView({ events }: EventsFilterViewProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const now = new Date();

  const filteredEvents = events.filter((evt) => {
    if (activeFilter === 'all') return true;
    const eventDate = new Date(evt.starts_at);
    if (activeFilter === 'upcoming') {
      return eventDate >= now || evt.status === 'published';
    }
    if (activeFilter === 'past') {
      return eventDate < now || evt.status === 'completed';
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 pb-2 border-b border-[#E5E6DE]">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#171914] text-[#C7F36B] shadow-sm'
              : 'bg-[#FFFFFF] text-[#62645C] border border-[#E5E6DE] hover:border-[#D3D5CA] hover:text-[#171914]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>All Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeFilter === 'upcoming'
              ? 'bg-[#171914] text-[#C7F36B] shadow-sm'
              : 'bg-[#FFFFFF] text-[#62645C] border border-[#E5E6DE] hover:border-[#D3D5CA] hover:text-[#171914]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Upcoming Rides ({events.filter(e => new Date(e.starts_at) >= now || e.status === 'published').length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('past')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeFilter === 'past'
              ? 'bg-[#171914] text-[#C7F36B] shadow-sm'
              : 'bg-[#FFFFFF] text-[#62645C] border border-[#E5E6DE] hover:border-[#D3D5CA] hover:text-[#171914]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Past Stages ({events.filter(e => new Date(e.starts_at) < now || e.status === 'completed').length})</span>
        </button>
      </div>

      {/* Grid of Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-20 rounded-3xl bg-[#FFFFFF] border border-[#E5E6DE] p-8 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#EAEDE2] text-[#62645C] flex items-center justify-center mx-auto">
            <Bike className="w-6 h-6 stroke-[2]" />
          </div>
          <p className="text-sm font-bold text-[#171914]">
            No cycling events found in this category.
          </p>
          <p className="text-xs text-[#62645C]">
            Please check back soon or switch filter tabs to view all scheduled rides.
          </p>
        </div>
      )}
    </div>
  );
}

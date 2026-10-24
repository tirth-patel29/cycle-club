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
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-4">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeFilter === 'all'
              ? 'bg-lime-500 text-black shadow-md'
              : 'bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>All Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeFilter === 'upcoming'
              ? 'bg-lime-500 text-black shadow-md'
              : 'bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Upcoming Rides ({events.filter(e => new Date(e.starts_at) >= now || e.status === 'published').length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('past')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeFilter === 'past'
              ? 'bg-lime-500 text-black shadow-md'
              : 'bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
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

      {filteredEvents.length === 0 && (
        <div className="text-center py-20 rounded-3xl border border-dashed border-zinc-300 dark:border-white/10 p-8 space-y-3">
          <Bike className="w-10 h-10 text-zinc-400 mx-auto" />
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            No events found in this category.
          </p>
        </div>
      )}
    </div>
  );
}

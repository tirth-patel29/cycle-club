import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { CyclingEvent } from '@/types';
import { formatINR, formatDateIndian, formatTimeIndian } from '@/lib/constants';

interface EventCardProps {
  event: CyclingEvent;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div className="group glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between transition-all duration-300 hover:border-[#b8f04c]/40 hover:-translate-y-1 shadow-lg">
      <div>
        {/* Image header */}
        <div className="relative h-52 sm:h-60 w-full bg-black overflow-hidden">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e120d] via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-[#b8f04c] text-[#0c1204] text-xs font-black uppercase px-2.5 py-1 rounded-md shadow-sm">
              {event.distance_km} KM
            </span>
            <span className="photo-overlay-pill text-xs font-bold uppercase px-2.5 py-1 rounded-md backdrop-blur-md">
              {event.difficulty}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-xs font-semibold">
            <span className="photo-overlay-pill px-2.5 py-1 rounded-md">
              +{event.elevation_gain_m}m Elevation
            </span>
            <span className="bg-[#b8f04c] text-[#0c1204] font-black px-2.5 py-1 rounded-md text-sm shadow-sm">
              {formatINR(event.registration_fee_paise)}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-2.5">
          <span className="text-xs text-[#628c15] dark:text-[#b8f04c] font-bold uppercase tracking-wider block">
            {formatDateIndian(event.starts_at)} • {formatTimeIndian(event.starts_at)}
          </span>

          <h4 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight leading-snug line-clamp-1 event-heading group-hover:text-[#628c15] dark:group-hover:text-[#b8f04c] transition-colors">
            {event.title}
          </h4>

          <p className="text-xs flex items-center gap-1.5 line-clamp-1 event-body">
            <MapPin className="w-3.5 h-3.5 text-[#628c15] dark:text-[#b8f04c] shrink-0" />
            <span>{event.venue}</span>
          </p>
        </div>
      </div>

      {/* Glossy Button */}
      <div className="p-5 sm:p-6 pt-0">
        <Link
          href={`/events/${event.slug}`}
          className="btn-glossy-lime w-full py-3.5 rounded-xl text-center flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider"
        >
          <span>VIEW DETAILS & REGISTER</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </Link>
      </div>
    </div>
  );
}

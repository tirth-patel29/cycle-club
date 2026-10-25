import React from 'react';
import Link from 'next/link';
import { MapPin, ChevronRight, Mountain } from 'lucide-react';
import { CyclingEvent } from '@/types';
import { formatINR, formatDateIndian, formatTimeIndian } from '@/lib/constants';

interface EventCardProps {
  event: CyclingEvent;
}

export function EventCard({ event }: EventCardProps) {
  const isFree = event.registration_fee_paise === 0;

  return (
    <div className="group surface-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300">
      <div>
        {/* Cover Photo Header */}
        <div className="relative h-52 sm:h-56 w-full bg-[#171914] overflow-hidden">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171914]/80 via-transparent to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-[#C7F36B] text-[#171914] text-xs font-black uppercase px-2.5 py-1 rounded-md shadow-xs">
              {event.distance_km} KM
            </span>
            <span className="photo-overlay-pill text-xs font-bold uppercase px-2.5 py-1 rounded-md">
              {event.difficulty}
            </span>
          </div>

          {/* Bottom Photo Overlay Badges */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-xs font-semibold">
            <span className="photo-overlay-pill px-2.5 py-1 rounded-md flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-[#C7F36B]" />
              <span>+{event.elevation_gain_m}m Elevation</span>
            </span>
            <span className="bg-[#C7F36B] text-[#171914] font-black px-2.5 py-1 rounded-md text-xs sm:text-sm shadow-xs">
              {isFree ? 'FREE ENTRY' : formatINR(event.registration_fee_paise)}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-3">
          <span className="text-xs text-[#3F6212] font-bold uppercase tracking-wider block">
            {formatDateIndian(event.starts_at)} • {formatTimeIndian(event.starts_at)}
          </span>

          <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#171914] leading-snug line-clamp-1 group-hover:text-[#3F6212] transition-colors font-sans">
            {event.title}
          </h3>

          <p className="text-xs flex items-center gap-1.5 text-[#62645C] line-clamp-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#3F6212] shrink-0" />
            <span>{event.venue}</span>
          </p>
        </div>
      </div>

      {/* Card Action */}
      <div className="p-5 sm:p-6 pt-0">
        <Link
          href={`/events/${event.slug}`}
          className="btn-glossy-lime w-full py-3.5 rounded-xl text-center flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-xs"
        >
          <span>VIEW DETAILS & REGISTER</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </Link>
      </div>
    </div>
  );
}

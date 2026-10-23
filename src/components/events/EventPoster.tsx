import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { CyclingEvent } from '@/types';
import { formatINR, formatDateIndian, formatTimeIndian } from '@/lib/constants';

interface EventPosterProps {
  event: CyclingEvent;
}

export function EventPoster({ event }: EventPosterProps) {
  return (
    <div className="w-full glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Side (7 Cols) */}
        <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[360px] lg:min-h-[480px] bg-black">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e120d] via-[#0e120d]/30 to-transparent" />

          {/* Badges on top of image */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-[#b8f04c] text-[#0c1204] px-3 py-1 rounded-md text-xs font-black uppercase shadow-sm">
              {event.distance_km} KM
            </span>
            <span className="photo-overlay-pill px-3 py-1 rounded-md text-xs font-bold uppercase backdrop-blur-md">
              {event.difficulty}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-medium">
            <span className="photo-overlay-pill backdrop-blur-md px-3 py-1 rounded-md">
              +{event.elevation_gain_m}m Elevation
            </span>
            <span className="bg-[#b8f04c] text-[#0c1204] font-black px-3 py-1 rounded-md shadow-sm">
              {formatINR(event.registration_fee_paise)}
            </span>
          </div>
        </div>

        {/* Right Content Side (5 Cols) */}
        <div className="lg:col-span-5 p-5 sm:p-8 flex flex-col justify-between event-content-panel space-y-6 transition-colors">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#b8f04c]">
              <Calendar className="w-4 h-4 text-[#82b822] dark:text-[#b8f04c]" />
              <span className="text-[#597d15] dark:text-[#b8f04c]">{formatDateIndian(event.starts_at)}</span>
              <span className="opacity-40">•</span>
              <Clock className="w-4 h-4 text-[#82b822] dark:text-[#b8f04c]" />
              <span className="text-[#597d15] dark:text-[#b8f04c]">{formatTimeIndian(event.starts_at)}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight event-heading">
              {event.title}
            </h3>

            <p className="text-xs sm:text-sm leading-relaxed event-body">
              {event.description}
            </p>

            <div className="flex items-start gap-2 text-xs event-venue-box p-3 rounded-xl transition-colors">
              <MapPin className="w-4 h-4 text-[#82b822] dark:text-[#b8f04c] shrink-0 mt-0.5" />
              <span><strong className="event-venue-label">Starting Venue:</strong> {event.venue}</span>
            </div>

            {/* Inclusions summary */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="flex items-center gap-1.5 event-inclusion">
                <span className="w-1.5 h-1.5 rounded-full bg-[#82b822] dark:bg-[#b8f04c]" />
                <span>Finisher Medal</span>
              </div>
              <div className="flex items-center gap-1.5 event-inclusion">
                <span className="w-1.5 h-1.5 rounded-full bg-[#82b822] dark:bg-[#b8f04c]" />
                <span>Hot Breakfast</span>
              </div>
              <div className="flex items-center gap-1.5 event-inclusion">
                <span className="w-1.5 h-1.5 rounded-full bg-[#82b822] dark:bg-[#b8f04c]" />
                <span>Backup SAG Van</span>
              </div>
              <div className="flex items-center gap-1.5 event-inclusion">
                <span className="w-1.5 h-1.5 rounded-full bg-[#82b822] dark:bg-[#b8f04c]" />
                <span>RFID / Bib Timing</span>
              </div>
            </div>
          </div>

          {/* Glossy Button */}
          <div className="pt-2">
            <Link
              href={`/events/${event.slug}/register`}
              className="btn-glossy-lime w-full py-4 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
            >
              <span>REGISTER NOW</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

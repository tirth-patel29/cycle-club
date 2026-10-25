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
    <div className="w-full surface-card rounded-3xl overflow-hidden border border-[#E5E6DE] shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Side (7 Cols) */}
        <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[360px] lg:min-h-[480px] bg-[#171914]">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171914]/80 via-transparent to-transparent" />

          {/* Badges on top of image */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-[#C7F36B] text-[#171914] px-3 py-1 rounded-md text-xs font-black uppercase shadow-xs">
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
            <span className="bg-[#C7F36B] text-[#171914] font-black px-3 py-1 rounded-md shadow-xs">
              {event.registration_fee_paise === 0 ? 'FREE ENTRY' : formatINR(event.registration_fee_paise)}
            </span>
          </div>
        </div>

        {/* Right Content Side (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#171914]">
              <Calendar className="w-4 h-4 text-[#171914]" />
              <span>{formatDateIndian(event.starts_at)}</span>
              <span className="text-[#62645C]">•</span>
              <Clock className="w-4 h-4 text-[#171914]" />
              <span>{formatTimeIndian(event.starts_at)}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-[#171914]">
              {event.title}
            </h3>

            <p className="text-xs sm:text-sm leading-relaxed text-[#62645C]">
              {event.description}
            </p>

            <div className="flex items-start gap-2 text-xs bg-[#F7F7F2] border border-[#E5E6DE] p-3 rounded-xl">
              <MapPin className="w-4 h-4 text-[#171914] shrink-0 mt-0.5" />
              <span className="text-[#171914]"><strong className="font-bold">Starting Venue:</strong> {event.venue}</span>
            </div>

            {/* Inclusions summary */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-[#171914]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171914]" />
                <span>Finisher Medal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171914]" />
                <span>Hot Breakfast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171914]" />
                <span>Backup SAG Van</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171914]" />
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

import React from 'react';
import Link from 'next/link';
import { CyclingEvent } from '@/types';
import { formatDateIndian } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';

interface Props {
  event: CyclingEvent | null;
}

export function ScrollingAnnouncementTicker({ event }: Props) {
  if (!event) return null;

  const isRegistrationOpen =
    new Date() <= new Date(event.registration_closes_at) && event.status === 'published';

  const formattedDate = formatDateIndian(event.starts_at);

  const TickerItem = () => (
    <div className="inline-flex items-center gap-4 px-6 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C7F36B] text-[#171914] text-[10px] font-black uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-[#171914] animate-pulse" />
        UPCOMING RIDE
      </span>
      <span className="text-white font-bold uppercase tracking-wider">{event.title}</span>
      <span className="text-[#8B8D83]">•</span>
      <span className="text-[#EAEDE2] font-medium">{formattedDate}</span>
      <span className="text-[#8B8D83]">•</span>
      {isRegistrationOpen ? (
        <span className="inline-flex items-center gap-1.5 text-[#C7F36B] font-bold uppercase tracking-wider">
          REGISTRATION OPEN
          <span className="text-white/80 font-normal ml-1">REGISTER NOW</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C7F36B] inline" />
        </span>
      ) : (
        <span className="text-rose-400 font-bold uppercase tracking-wider">
          REGISTRATION CLOSED
        </span>
      )}
      <span className="text-[#8B8D83]">•</span>
    </div>
  );

  return (
    <div className="w-full bg-[#171914] text-white border-b border-[#2A2D24] overflow-hidden select-none relative z-30">
      <Link
        href={`/events/${event.slug}`}
        className="block py-2.5 hover:bg-[#22251D] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#C7F36B]"
        title={`View ${event.title}`}
      >
        <div className="relative w-full overflow-hidden">
          <div className="animate-ticker flex">
            {/* Seamless 2-segment continuous track */}
            <div className="flex shrink-0">
              <TickerItem />
              <TickerItem />
              <TickerItem />
              <TickerItem />
            </div>
            <div className="flex shrink-0">
              <TickerItem />
              <TickerItem />
              <TickerItem />
              <TickerItem />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}


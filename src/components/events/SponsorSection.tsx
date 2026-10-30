'use client';

import React from 'react';
import { EventSponsor } from '@/types';
import { DEFAULT_EVENT_SPONSORS } from '@/lib/constants';

interface Props {
  sponsors?: EventSponsor[];
  className?: string;
}

export function SponsorSection({ sponsors, className = '' }: Props) {
  const activeSponsors = sponsors && sponsors.length > 0 ? sponsors : DEFAULT_EVENT_SPONSORS;

  return (
    <div className={`surface-card rounded-2xl p-5 sm:p-6 border border-[#E5E6DE] space-y-4 shadow-xs ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#3F6212] font-mono">
          OUR PROUD SPONSORS
        </h3>
        <span className="text-[10px] font-mono text-[#62645C] uppercase font-semibold">
          Official Support
        </span>
      </div>

      {/* Responsive layout: 3-column row on desktop, neat wrap/stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {activeSponsors.map((sponsor, idx) => (
          <div
            key={sponsor.id || `sponsor-${idx}`}
            className="group flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E6DE] hover:border-[#3F6212]/40 transition-all text-center min-h-[96px]"
          >
            <div className="w-full h-12 flex items-center justify-center mb-2 px-1">
              <img
                src={sponsor.logo_url}
                alt={sponsor.name}
                loading="lazy"
                className="max-h-10 max-w-full object-contain filter group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <span className="text-[11px] font-bold text-[#171914] tracking-tight uppercase line-clamp-1">
              {sponsor.name}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-center text-[#62645C] font-medium pt-1 border-t border-[#E5E6DE]/60">
        Proudly supported by Anand cycling ecosystem partners & community champions.
      </p>
    </div>
  );
}


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
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {activeSponsors.map((sponsor, idx) => (
          <div
            key={sponsor.id || `sponsor-${idx}`}
            className="group flex items-center justify-center p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E6DE] hover:border-[#3F6212]/40 transition-all text-center h-20 sm:h-22 shadow-2xs"
          >
            <div className="w-full h-full flex items-center justify-center p-1">
              <img
                src={sponsor.logo_url}
                alt={sponsor.name || `Partner logo ${idx + 1}`}
                loading="lazy"
                className="max-h-12 sm:max-h-14 max-w-full object-contain filter group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-center text-[#62645C] font-medium pt-1 border-t border-[#E5E6DE]/60">
        Proudly supported by Anand cycling ecosystem partners & community champions.
      </p>
    </div>
  );
}


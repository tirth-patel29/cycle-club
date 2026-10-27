'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  alt: string;
}

export function HeroBannerImage({ alt }: Props) {
  const [imgSrc, setImgSrc] = useState<string>('/banner.jpg');

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5E6DE] shadow-xl bg-[#171914]">
      <div className="relative w-full h-[280px] sm:h-[420px] lg:h-[500px]">
        <img
          src={imgSrc}
          onError={() => {
            // Fallback to high-resolution peloton asset if public/banner.jpg is pending upload
            if (imgSrc !== '/bg.avif' && !imgSrc.includes('unsplash')) {
              setImgSrc('https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=2000&q=80');
            }
          }}
          alt={alt}
          className="w-full h-full object-cover object-center transition-opacity duration-300"
          loading="eager"
        />
        {/* Editorial Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171914]/90 via-[#171914]/25 to-transparent pointer-events-none" />

        {/* Verified Safety Overlay Pills */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold pointer-events-none">
          <div className="photo-overlay-pill px-3.5 py-1.5 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C7F36B]" />
            <span>Helmets Compulsory</span>
          </div>
          <div className="photo-overlay-pill px-3.5 py-1.5 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C7F36B]" />
            <span>Backup SAG Support Van</span>
          </div>
          <div className="photo-overlay-pill px-3.5 py-1.5 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C7F36B]" />
            <span>Road • Hybrid • MTB • City • Gravel</span>
          </div>
        </div>
      </div>
    </div>
  );
}

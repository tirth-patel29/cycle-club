'use client';

import React, { useState } from 'react';

interface Props {
  alt: string;
}

export function HeroBannerImage({ alt }: Props) {
  const [imgSrc, setImgSrc] = useState<string>('/main.jpeg');

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5E6DE] shadow-xl bg-[#171914]">
      <div className="relative w-full h-[320px] sm:h-[460px] lg:h-[540px]">
        <img
          src={imgSrc}
          onError={() => {
            if (imgSrc !== '/banner.jpg') {
              setImgSrc('/banner.jpg');
            }
          }}
          alt={alt}
          className="w-full h-full object-cover object-[center_30%] transition-opacity duration-300"
          loading="eager"
        />
        {/* Editorial Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171914]/90 via-[#171914]/25 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

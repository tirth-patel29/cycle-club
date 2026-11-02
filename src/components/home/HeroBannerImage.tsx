'use client';

import React, { useState } from 'react';

interface Props {
  alt: string;
}

export function HeroBannerImage({ alt }: Props) {
  const [imgSrc, setImgSrc] = useState<string>('/main.webp');

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5E6DE] shadow-xl bg-[#171914]">
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[16/11] xl:aspect-[16/11] max-h-[720px] 2xl:max-h-[820px]">
        <img
          src={imgSrc}
          onError={() => {
            if (imgSrc === '/main.webp') {
              setImgSrc('/IMG_3955.jpeg');
            } else if (imgSrc !== '/IMG_0934.JPG.jpeg') {
              setImgSrc('/IMG_0934.JPG.jpeg');
            }
          }}
          alt={alt}
          className="w-full h-full object-cover object-[center_20%] sm:object-[center_18%] transition-opacity duration-300"
          loading="eager"
          fetchPriority="high"
        />
        {/* Soft Contrast Overlay: keeps bottom members and top statue visible without harsh darkening */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171914]/40 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

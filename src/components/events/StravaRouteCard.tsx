import React from 'react';
import { ExternalLink, Navigation, Mountain, Compass, ArrowRight } from 'lucide-react';

interface Props {
  stravaRouteUrl?: string | null;
  distanceKm?: number;
  elevationGainM?: number;
  venue?: string;
}

export function StravaRouteCard({
  stravaRouteUrl,
  distanceKm,
  elevationGainM,
  venue
}: Props) {
  if (!stravaRouteUrl || !stravaRouteUrl.trim()) {
    return null;
  }

  const safeUrl = stravaRouteUrl.trim().startsWith('http')
    ? stravaRouteUrl.trim()
    : `https://${stravaRouteUrl.trim()}`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#171914] border border-[#2B2D26] text-white p-6 sm:p-8 shadow-md transition-all hover:border-[#FC5200]/50 group">
      {/* Background Topographic Contour Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.14] mix-blend-screen"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(ellipse at 80% 20%, #FC5200 0%, transparent 50%),
            repeating-radial-gradient(circle at 100% 100%, transparent 0, transparent 20px, rgba(252, 82, 0, 0.15) 21px, transparent 22px, transparent 40px)`
        }}
      />

      {/* Decorative SVG Topographic Lines */}
      <svg
        className="absolute -right-8 -bottom-8 w-72 h-72 pointer-events-none opacity-20 text-[#FC5200]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M10 100 Q 50 20, 100 80 T 190 60" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M0 130 Q 60 50, 120 110 T 200 90" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 160 Q 70 80, 140 140 T 210 120" stroke="currentColor" strokeWidth="1.2" />
        <path d="M40 190 Q 90 110, 160 170 T 220 150" stroke="currentColor" strokeWidth="1" />
      </svg>

      <div className="relative z-10 space-y-6">
        {/* Header Eyebrow & Strava Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Strava Iconic Double Chevron Logo */}
            <span className="w-6 h-6 rounded-md bg-[#FC5200] flex items-center justify-center p-1 shadow-sm shrink-0">
              <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.008 13.827h4.172" />
              </svg>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FC5200] font-mono">
              RIDE THE ROUTE
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wider border border-white/15">
            <Navigation className="w-3 h-3 text-[#FC5200]" />
            <span>Official GPX Course</span>
          </span>
        </div>

        {/* Heading & Supporting Text */}
        <div className="space-y-2 max-w-xl">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-white font-sans leading-tight">
            EXPLORE THE OFFICIAL ROUTE
          </h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
            Preview the route, explore the course and get ready for the ride. View turn-by-turn road conditions, elevation gradients, and download the GPX track to your bike computer.
          </p>
        </div>

        {/* Route Snapshot Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {distanceKm !== undefined && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[10px] uppercase text-white/50 block font-semibold">Course Distance</span>
              <p className="text-sm sm:text-base font-extrabold text-white pt-0.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#FC5200]" />
                <span>{distanceKm} KM</span>
              </p>
            </div>
          )}

          {elevationGainM !== undefined && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[10px] uppercase text-white/50 block font-semibold">Total Elevation</span>
              <p className="text-sm sm:text-base font-extrabold text-white pt-0.5 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-[#FC5200]" />
                <span>+{elevationGainM}m</span>
              </p>
            </div>
          )}

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] uppercase text-white/50 block font-semibold">Navigation Sync</span>
            <p className="text-xs sm:text-sm font-bold text-white pt-0.5 truncate">
              Garmin • Wahoo • Phone
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#FC5200] hover:bg-[#e04800] text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99] w-full sm:w-auto"
          >
            <span>EXPLORE ON STRAVA</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </a>
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { EventCapacityInfo } from '@/types';

interface Props {
  eventId: string;
  initialCapacity?: EventCapacityInfo | null;
  onCapacityChange?: (info: EventCapacityInfo) => void;
}

export function LiveRegistrationProgress({ eventId, initialCapacity, onCapacityChange }: Props) {
  const [capacity, setCapacity] = useState<EventCapacityInfo | null>(initialCapacity || null);
  const [loading, setLoading] = useState(!initialCapacity);

  const fetchCapacity = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/capacity`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data: EventCapacityInfo = await res.json();
        setCapacity(data);
        if (onCapacityChange) {
          onCapacityChange(data);
        }
      }
    } catch {
      // Graceful fallback on network glitch
    } finally {
      setLoading(false);
    }
  }, [eventId, onCapacityChange]);

  useEffect(() => {
    fetchCapacity();

    // 12-second polling interval with visibility check
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchCapacity();
      }
    }, 12000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchCapacity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchCapacity]);

  if (!capacity && loading) {
    return (
      <div className="surface-card rounded-2xl p-4 sm:p-5 border border-[#E5E6DE] animate-pulse space-y-3">
        <div className="h-4 bg-[#EAEDE2] rounded w-1/3"></div>
        <div className="h-8 bg-[#EAEDE2] rounded w-1/2"></div>
        <div className="h-2.5 bg-[#EAEDE2] rounded-full"></div>
      </div>
    );
  }

  const confirmed = capacity?.confirmed_count ?? 0;
  const maxCap = capacity?.max_capacity ?? null;
  const isUnlimited = capacity?.is_unlimited ?? (maxCap === null);
  const isFull = capacity?.is_full ?? false;
  const percentage = capacity?.percentage_filled ?? (isUnlimited ? 0 : 0);
  const remaining = capacity?.remaining_capacity ?? null;
  const status = capacity?.status ?? 'open';

  // Cyclist position along track (clamped between 0% and 94% to avoid overflow)
  const cyclistPositionPercent = Math.min(94, Math.max(0, percentage - 3));

  return (
    <div className="surface-card rounded-2xl p-4 sm:p-5 border border-[#E5E6DE] space-y-3.5 shadow-xs">
      {/* Top Header Row */}
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="font-mono uppercase tracking-wider text-[#171914]">
          RIDE REGISTRATION
        </span>

        {isFull ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            REGISTRATION FULL
          </span>
        ) : status === 'almost_full' && remaining !== null ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Only {remaining} {remaining === 1 ? 'spot' : 'spots'} remaining
          </span>
        ) : isUnlimited ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            OPEN ENROLLMENT
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            REGISTRATIONS OPEN
          </span>
        )}
      </div>

      {/* Numbers Row */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl sm:text-3xl font-black text-[#171914] font-mono tracking-tight tabular-nums">
            {isUnlimited ? confirmed : `${confirmed} / ${maxCap}`}
          </div>
          <span className="text-[10px] text-[#62645C] font-mono uppercase font-bold tracking-wider block">
            RIDERS CONFIRMED
          </span>
        </div>

        {!isUnlimited && (
          <span className="text-xs font-mono font-bold text-[#3F6212]">
            {percentage}% filled
          </span>
        )}
      </div>

      {/* Progress Track & Animated Cyclist (if not unlimited) */}
      {!isUnlimited && (
        <div className="space-y-1 pt-1">
          {/* Track Container */}
          <div className="relative pt-4 pb-1">
            {/* Animated Cyclist Element */}
            <div
              className="absolute top-0 transition-all duration-700 ease-out transform -translate-x-1/2 pointer-events-none"
              style={{ left: `${percentage}%` }}
              aria-hidden="true"
            >
              <div className="cyclist-rider-badge">
                <svg
                  className="w-5 h-5 text-[#3F6212] motion-safe:animate-bounce-subtle"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Wheel 1 */}
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  {/* Wheel 2 */}
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  {/* Frame */}
                  <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5 3-7.5-3.5-3H9l-2 4" />
                  <path d="m14 11.5-6 6" />
                </svg>
              </div>
            </div>

            {/* Track Bar */}
            <div className="h-2.5 rounded-full bg-[#EAEDE2] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isFull ? 'bg-rose-500' : 'bg-[#A5D92E]'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Contextual Scarcity / Availability Caption */}
      <p className="text-[11px] text-[#62645C] font-medium leading-relaxed">
        {isFull
          ? 'Registration is currently full. Existing confirmed riders can still access their official passes.'
          : status === 'almost_full' && remaining !== null
          ? `High demand: Only ${remaining} ${remaining === 1 ? 'spot' : 'spots'} left before automatic ride closure.`
          : isUnlimited
          ? 'Open community ride. Register to reserve your finisher digital bib plate.'
          : 'Limited spots available. Register to join the ride.'}
      </p>
    </div>
  );
}


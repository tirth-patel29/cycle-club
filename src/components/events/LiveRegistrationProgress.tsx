'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { EventCapacityInfo } from '@/types';

interface Props {
  eventId: string;
  initialCapacity?: EventCapacityInfo | null;
  onCapacityChange?: (info: EventCapacityInfo) => void;
  isRegistrationOpen?: boolean;
}

export function LiveRegistrationProgress({
  eventId,
  initialCapacity,
  onCapacityChange,
  isRegistrationOpen = true
}: Props) {
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

  // Registration is open only when not full and within the registration window
  const isOpen = !isFull && isRegistrationOpen;

  return (
    <div className="surface-card rounded-2xl p-4 sm:p-5 border border-[#E5E6DE] space-y-4 shadow-xs">
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
        ) : !isRegistrationOpen ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EAEDE2] text-[#62645C] border border-[#E5E6DE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#62645C]" />
            REGISTRATION CLOSED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            REGISTRATIONS OPEN
          </span>
        )}
      </div>

      {/* ========================================================
          OPEN REGISTRATION STATE:
          - Replaces rider count, percentage & progress bar
          - Features "FEW SPOTS LEFT" + callout text
          - Subtle cycling-themed visual accent
          ======================================================== */}
      {isOpen ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F7F7F2] via-[#F7F7F2] to-[#EAEDE2]/70 border border-[#E5E6DE] p-4 sm:p-5">
          {/* Subtle cycling-themed watermark graphic */}
          <div
            className="absolute -right-3 -bottom-3 text-[#171914]/[0.04] pointer-events-none select-none"
            aria-hidden="true"
          >
            <svg
              className="w-24 h-24 sm:w-28 sm:h-28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="5.5" cy="17.5" r="3.5" />
              <circle cx="18.5" cy="17.5" r="3.5" />
              <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5 3-7.5-3.5-3H9l-2 4" />
              <path d="m14 11.5-6 6" />
            </svg>
          </div>

          <div className="relative z-10 flex items-start gap-3.5">
            {/* Cycling-themed badge icon */}
            <div className="w-10 h-10 rounded-xl bg-[#171914] text-[#C7F36B] flex items-center justify-center shrink-0 shadow-sm border border-[#2A2D24]">
              <svg
                className="w-5 h-5 motion-safe:animate-bounce-subtle"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5 3-7.5-3.5-3H9l-2 4" />
                <path d="m14 11.5-6 6" />
              </svg>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-[#171914] tracking-tight uppercase font-sans">
                  FEW SPOTS LEFT!
                </span>
                <span className="inline-flex w-2 h-2 rounded-full bg-[#8cc427] animate-pulse" />
              </div>
              <p className="text-xs text-[#62645C] font-medium leading-relaxed">
                Don&apos;t miss your chance to ride with us. Secure your spot today!
              </p>
            </div>
          </div>
        </div>
      ) : isFull ? (
        /* ========================================================
           CLOSED / FULL STATE:
           - Preserves old UI flow and registration-closed messaging
           ======================================================== */
        <div className="space-y-3.5">
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
              <span className="text-xs font-mono font-bold text-rose-600">
                100% filled
              </span>
            )}
          </div>

          {/* Full progress track */}
          {!isUnlimited && (
            <div className="space-y-1 pt-1">
              <div className="relative pt-2 pb-1">
                <div className="h-2.5 rounded-full bg-[#EAEDE2] overflow-hidden">
                  <div className="h-full rounded-full bg-rose-500 w-full" />
                </div>
              </div>
            </div>
          )}

          {/* Contextual full caption */}
          <p className="text-[11px] text-[#62645C] font-medium leading-relaxed">
            Registration is currently full. Existing confirmed riders can still access their official passes.
          </p>
        </div>
      ) : (
        /* ========================================================
           CLOSED DEADLINE PASSED STATE:
           - Preserves old registration-closed message
           ======================================================== */
        <div className="space-y-2.5">
          <div className="p-3.5 rounded-xl bg-[#EAEDE2]/60 border border-[#E5E6DE] text-center space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#171914]">
              REGISTRATION CLOSED
            </div>
            <p className="text-[11px] text-[#62645C] font-medium">
              The online registration window for this ride has closed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

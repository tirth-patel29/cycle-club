'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CyclingEvent } from '@/types';
import { X } from 'lucide-react';

interface Props {
  event: CyclingEvent | null;
}

export function AnnouncementPosterModal({ event }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!event || !event.is_popup_active || !event.poster_url) {
      return;
    }

    try {
      const storageKey = `acc_poster_dismissed_${event.id}`;
      const isDismissed = sessionStorage.getItem(storageKey);
      if (!isDismissed) {
        // Gentle delay after page mount
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }
  }, [event]);

  const handleDismiss = useCallback(() => {
    if (event?.id) {
      try {
        sessionStorage.setItem(`acc_poster_dismissed_${event.id}`, 'true');
      } catch {
        // Ignore sessionStorage restrictions if private mode
      }
    }
    setIsOpen(false);
  }, [event?.id]);

  const handlePosterClick = () => {
    if (!event) return;
    handleDismiss();
    const targetUrl = event.poster_redirect_url?.trim() || `/events/${event.slug}`;
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      window.location.href = targetUrl;
    } else {
      router.push(targetUrl);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDismiss]);

  if (!isOpen || !event || !event.poster_url) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${event.title} Announcement`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm transition-all duration-300"
      onClick={handleDismiss}
    >
      <div
        className="relative max-w-2xl w-full max-h-[92vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close Announcement"
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#171914] text-white hover:text-[#C7F36B] border border-white/20 shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-[#C7F36B]"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Poster Container preserving intrinsic aspect ratio */}
        <div
          onClick={handlePosterClick}
          className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-[#171914] max-h-[85vh] flex items-center justify-center"
        >
          <img
            src={event.poster_url}
            alt={`${event.title} Announcement Poster`}
            className="w-auto h-auto max-w-full max-h-[82vh] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-x-0 bottom-0 py-2.5 px-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-white text-xs font-semibold">
            <span>Click to explore event details</span>
            <span className="text-[#C7F36B] font-bold">Open Details →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

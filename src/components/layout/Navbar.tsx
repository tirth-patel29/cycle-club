'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Bike, Search, ChevronRight } from 'lucide-react';
import { CLUB_NAME } from '@/lib/constants';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#ffffff]/95 dark:bg-[#0c0f0a]/95 backdrop-blur-md border-b border-black/10 dark:border-white/10 transition-colors shadow-xs dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#b8f04c] text-[#0c1204] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(184,240,76,0.35)] group-hover:scale-105 transition-transform">
              <Bike className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white tracking-tight uppercase leading-none">
                {CLUB_NAME}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-white/50 tracking-wider uppercase font-semibold mt-0.5">
                Anand, Gujarat
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Simple, clear, no jargon */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-bold">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-lg text-slate-800 hover:text-black hover:bg-slate-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#events"
              className="px-3.5 py-2 rounded-lg text-slate-800 hover:text-black hover:bg-slate-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
              Upcoming Rides
            </Link>
            <Link
              href="/events"
              className="px-3.5 py-2 rounded-lg text-slate-800 hover:text-black hover:bg-slate-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
              All Events
            </Link>
            <Link
              href="/registrations/lookup"
              className="px-3.5 py-2 rounded-lg text-[#2e4a06] hover:text-[#1d3003] dark:text-[#b8f04c] dark:hover:text-[#d4ff6e] hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-[#2e4a06] dark:text-[#b8f04c]" />
              <span>Find My Pass</span>
            </Link>
          </nav>

          {/* Right Action: Glossy Button & Theme Toggle */}
          <div className="hidden md:flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/#events"
              className="btn-glossy-lime px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>JOIN A RIDE</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle className="p-2" />
            <Link
              href="/registrations/lookup"
              className="p-2 rounded-lg text-slate-700 dark:text-white/80 hover:text-[#4d710d] dark:hover:text-[#b8f04c] hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Find Pass"
            >
              <Search className="w-5 h-5 text-[#4d710d] dark:text-[#b8f04c]" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#4d710d] dark:text-[#b8f04c]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer - Simple, clean, large buttons for easy tapping */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0c0f0a] border-b border-black/10 dark:border-white/15 px-4 pt-3 pb-6 space-y-2 text-sm font-semibold shadow-2xl">
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-black/10 dark:border-white/10">
            <span className="text-xs uppercase text-slate-600 dark:text-white/60 font-bold">Theme Mode</span>
            <ThemeToggle />
          </div>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 px-3 rounded-xl text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
          >
            Home
          </Link>
          <Link
            href="/#events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 px-3 rounded-xl text-slate-700 dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/10"
          >
            Upcoming Rides
          </Link>
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 px-3 rounded-xl text-slate-700 dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/10"
          >
            All Cycling Events
          </Link>
          <Link
            href="/registrations/lookup"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-3 px-3 rounded-xl text-[#4d710d] dark:text-[#b8f04c] bg-black/5 dark:bg-white/5"
          >
            <Search className="w-4 h-4" />
            <span>Find My Rider Pass</span>
          </Link>
          <div className="pt-2">
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-glossy-lime w-full py-3.5 rounded-xl text-center block text-xs font-black uppercase tracking-wider"
            >
              JOIN A RIDE
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

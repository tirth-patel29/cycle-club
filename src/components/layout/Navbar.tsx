'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bike, Search, ChevronRight, User } from 'lucide-react';
import { CLUB_NAME } from '@/lib/constants';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(Boolean(data.authenticated));
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('acc_auth_changed', handleAuthChange);

    return () => {
      window.removeEventListener('acc_auth_changed', handleAuthChange);
    };
  }, [pathname, checkAuth]);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E5E6DE] transition-all shadow-[0_2px_12px_-2px_rgba(23,25,20,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#C7F36B] text-[#171914] flex items-center justify-center font-bold shadow-[0_2px_10px_rgba(199,243,107,0.45)] group-hover:scale-105 transition-transform">
              <Bike className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg text-[#171914] tracking-tight uppercase leading-none font-sans">
                {CLUB_NAME}
              </span>
              <span className="text-[10px] text-[#62645C] tracking-wider uppercase font-bold mt-0.5">
                Anand, Gujarat
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <Link
              href="/"
              className={`px-4 py-2.5 rounded-lg transition-colors ${
                pathname === '/'
                  ? 'text-[#171914] bg-[#EAEDE2] font-black'
                  : 'text-[#62645C] hover:text-[#171914] hover:bg-[#EAEDE2]/60'
              }`}
            >
              Home
            </Link>
            <Link
              href="/events"
              className={`px-4 py-2.5 rounded-lg transition-colors ${
                pathname.startsWith('/events')
                  ? 'text-[#171914] bg-[#EAEDE2] font-black'
                  : 'text-[#62645C] hover:text-[#171914] hover:bg-[#EAEDE2]/60'
              }`}
            >
              Rides & Events
            </Link>
            <Link
              href="/registrations/lookup"
              className="px-4 py-2.5 rounded-lg text-[#3F6212] hover:text-[#171914] hover:bg-[#C7F36B]/25 transition-colors flex items-center gap-1.5 font-extrabold"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Find My Pass</span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/profile"
                className="btn-glossy-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
              >
                <User className="w-4 h-4 text-[#C7F36B]" />
                <span>MY PROFILE</span>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="btn-glossy-dark px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
              >
                <User className="w-4 h-4 text-[#C7F36B]" />
                <span>RIDER SIGN IN</span>
              </Link>
            )}
            <Link
              href="/events"
              className="btn-glossy-lime px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>JOIN A RIDE</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>

          {/* Mobile Navigation Controls */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/registrations/lookup"
              className="p-2.5 rounded-xl text-[#3F6212] bg-[#EAEDE2]/80 hover:bg-[#C7F36B]/30"
              aria-label="Find Rider Pass"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#171914] bg-[#EAEDE2]/80 hover:bg-[#EAEDE2] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-b border-[#E5E6DE] px-4 pt-3 pb-6 space-y-2 text-sm font-semibold shadow-xl animate-fade-up">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-3 px-3.5 rounded-xl ${
              pathname === '/' ? 'bg-[#EAEDE2] font-black text-[#171914]' : 'text-[#62645C] hover:bg-[#EAEDE2]/50'
            }`}
          >
            Home
          </Link>
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-3 px-3.5 rounded-xl ${
              pathname.startsWith('/events') ? 'bg-[#EAEDE2] font-black text-[#171914]' : 'text-[#62645C] hover:bg-[#EAEDE2]/50'
            }`}
          >
            All Cycling Events
          </Link>
          {isAuthenticated ? (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-3 px-3.5 rounded-xl text-[#171914] bg-[#EAEDE2]/60 hover:bg-[#EAEDE2] font-bold"
            >
              <User className="w-4 h-4 text-[#3F6212]" />
              <span>Rider Profile & Registered Rides</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-3 px-3.5 rounded-xl text-[#171914] hover:bg-[#EAEDE2] font-bold"
            >
              <User className="w-4 h-4 text-[#3F6212]" />
              <span>Rider Sign In</span>
            </Link>
          )}
          <Link
            href="/registrations/lookup"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 py-3 px-3.5 rounded-xl text-[#3F6212] bg-[#C7F36B]/20 font-bold"
          >
            <Search className="w-4 h-4" />
            <span>Find My Rider Pass</span>
          </Link>
          <div className="pt-3">
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

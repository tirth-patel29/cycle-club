'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bike, LayoutDashboard, Calendar, Users, ExternalLink, LogOut } from 'lucide-react';
import { CLUB_NAME } from '@/lib/constants';

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignored
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('acc_auth_changed'));
    }
    router.push('/admin/login');
    router.refresh();
  };

  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Events Management', href: '/admin/events', icon: Calendar },
    { name: 'Registrations', href: '/admin/registrations', icon: Users },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md text-[#171914] border-b border-[#E5E6DE] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C7F36B] text-[#171914] flex items-center justify-center font-bold shadow-xs">
              <Bike className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#171914]">
                {CLUB_NAME}
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-[#EAEDE2] text-[#171914] px-2 py-0.5 rounded border border-[#E5E6DE]">
                Admin Console
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs uppercase font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#171914] text-[#C7F36B]'
                      : 'text-[#62645C] hover:text-[#171914] hover:bg-[#F7F7F2]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-[#62645C] hover:text-[#171914] flex items-center gap-1.5 hidden sm:flex"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs font-bold uppercase tracking-wider text-rose-700 hover:bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary nav */}
        <div className="flex md:hidden border-t border-[#E5E6DE] py-2 gap-2 overflow-x-auto text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 font-semibold ${
                  isActive
                    ? 'bg-[#171914] text-[#C7F36B]'
                    : 'text-[#62645C]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

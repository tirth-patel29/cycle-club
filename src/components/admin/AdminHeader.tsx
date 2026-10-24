'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bike, LayoutDashboard, Calendar, Users, ExternalLink, LogOut } from 'lucide-react';
import { CLUB_NAME } from '@/lib/constants';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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
    <header className="bg-white/95 dark:bg-[#0c0f0a]/95 backdrop-blur-md text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#b8f04c] text-[#0c1204] flex items-center justify-center font-bold shadow-sm">
              <Bike className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-950 dark:text-white">
                {CLUB_NAME}
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-lime-500/10 text-lime-700 dark:text-[#b8f04c] px-2 py-0.5 rounded border border-lime-500/20">
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
                      ? 'bg-lime-500/10 text-lime-700 dark:text-[#b8f04c] border border-lime-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
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
            <ThemeToggle />
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#2e4a06] dark:hover:text-[#b8f04c] flex items-center gap-1.5 hidden sm:flex"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary nav */}
        <div className="flex md:hidden border-t border-slate-200 dark:border-white/10 py-2 gap-2 overflow-x-auto text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 font-semibold ${
                  isActive
                    ? 'bg-lime-500/10 text-lime-700 dark:text-[#b8f04c] border border-lime-500/20'
                    : 'text-slate-600 dark:text-slate-400'
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

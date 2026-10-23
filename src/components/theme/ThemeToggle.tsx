'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check initial theme from localStorage or document
    const isLight = document.documentElement.classList.contains('light');
    const stored = localStorage.getItem('acc-theme');
    if (stored === 'light' || (!stored && isLight)) {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      setTheme('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    setMounted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('acc-theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('acc-theme', 'dark');
      setTheme('dark');
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className={`w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center opacity-80 ${className}`}
        aria-label="Toggle theme"
      >
        <span className="w-4 h-4 rounded-full bg-white/20" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl transition-all duration-200 border cursor-pointer select-none flex items-center justify-center gap-1.5 ${
        theme === 'dark'
          ? 'bg-white/10 border-white/15 text-[#b8f04c] hover:bg-white/15 hover:border-white/25 shadow-[0_0_12px_rgba(184,240,76,0.2)]'
          : 'bg-black/5 border-black/15 text-slate-800 hover:bg-black/10 hover:border-black/25 shadow-sm'
      } ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-[#b8f04c] stroke-[2.5]" />
          <span className="text-[11px] font-bold uppercase tracking-wider hidden xl:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-slate-800 stroke-[2.5]" />
          <span className="text-[11px] font-bold uppercase tracking-wider hidden xl:inline text-slate-800">Dark</span>
        </>
      )}
    </button>
  );
}

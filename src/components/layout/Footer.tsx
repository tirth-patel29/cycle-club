import React from 'react';
import Link from 'next/link';
import { Bike, ShieldCheck, Heart } from 'lucide-react';
import { CLUB_NAME, CLUB_LOCATION, CLUB_CONTACT_EMAIL, CLUB_CONTACT_PHONE } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="w-full bg-[#EAEDE2] border-t border-[#E5E6DE] text-[#62645C] py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-[#D3D5CA]">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C7F36B] text-[#171914] flex items-center justify-center font-bold shadow-sm">
              <Bike className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-[#171914] uppercase tracking-tight font-sans">
                {CLUB_NAME}
              </span>
              <p className="text-[#62645C] text-xs font-medium">
                {CLUB_LOCATION}
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-wider">
            <Link href="/" className="text-[#62645C] hover:text-[#171914] transition-colors">
              Home
            </Link>
            <Link href="/events" className="text-[#62645C] hover:text-[#171914] transition-colors">
              Rides & Events
            </Link>
            <Link href="/registrations/lookup" className="text-[#3F6212] hover:text-[#171914] transition-colors">
              Find My Pass
            </Link>
            <Link href="/profile" className="text-[#62645C] hover:text-[#171914] transition-colors">
              Rider Profile
            </Link>
          </div>

          {/* Contact Details */}
          <div className="text-xs text-[#62645C] space-y-1">
            <p className="font-medium">
              Rider Helpline: <strong className="text-[#171914] font-bold">{CLUB_CONTACT_PHONE}</strong>
            </p>
            <p className="font-medium">{CLUB_CONTACT_EMAIL}</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#62645C]">
          <p>© {new Date().getFullYear()} {CLUB_NAME}. Anand, Gujarat. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[#3F6212] font-bold">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>Safety First • Helmets Mandatory • Zero-Drop Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

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
            <div className="w-10 h-10 rounded-xl bg-white border border-[#D3D5CA] flex items-center justify-center p-0.5 shadow-sm overflow-hidden">
              <img
                src="/logo.webp"
                alt="THE ANAND CYCLING CLUB Logo"
                className="w-full h-full object-contain"
              />
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
            <Link href="/profile" className="text-[#62645C] hover:text-[#171914] transition-colors">
              Rider Profile
            </Link>
            <Link href="/contact" className="text-[#62645C] hover:text-[#171914] transition-colors">
              Contact
            </Link>
          </div>

          {/* Contact Details & Social Channels */}
          <div className="text-xs text-[#62645C] space-y-2">
            <p className="font-medium">
              Rider Helpline:{' '}
              <a href="tel:7043066800" className="hover:text-[#171914] transition-colors">
                <strong className="text-[#171914] font-bold">{CLUB_CONTACT_PHONE}</strong>
              </a>
            </p>
            <p className="font-medium">
              <a href={`mailto:${CLUB_CONTACT_EMAIL}`} className="hover:text-[#171914] transition-colors hover:underline">
                {CLUB_CONTACT_EMAIL}
              </a>
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://www.facebook.com/anandcycling/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D3D5CA] text-[#171914] hover:text-[#1877F2] hover:border-[#1877F2]/40 text-xs font-bold transition-all shadow-2xs"
                title="Follow The Anand Cycling Club on Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </a>

              <a
                href="https://www.instagram.com/anandcyclingclub/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D3D5CA] text-[#171914] hover:text-[#E4405F] hover:border-[#E4405F]/40 text-xs font-bold transition-all shadow-2xs"
                title="Follow The Anand Cycling Club on Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Rule Book & Compliance */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-[#62645C] pt-2 border-b border-[#D3D5CA] pb-6">
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/rules" className="hover:text-[#171914] transition-colors underline-offset-4 hover:underline font-bold">
              Rule Book — Safety, Refunds &amp; Privacy
            </Link>
          </div>
          <div className="text-[#8B8D83]">
            Payments Powered by Razorpay (RBI Compliant)
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

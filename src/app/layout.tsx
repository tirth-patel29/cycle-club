import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CLUB_NAME, CLUB_TAGLINE } from '@/lib/constants';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const viewport: Viewport = {
  themeColor: '#F7F7F2',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: `${CLUB_NAME} • Official Events & Races`,
  description: `${CLUB_NAME} - ${CLUB_TAGLINE}. Endurance brevets, sunrise pacelines, and community cycling across Anand & Charotar, Gujarat.`,
  keywords: ['THE ANAND CYCLING CLUB', 'Anand Cycling Club', 'Cycling Gujarat', 'Amul cycling', 'Brevets India', 'Charotar cycling', 'Weekend rides Anand'],
  authors: [{ name: 'THE ANAND CYCLING CLUB' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} scroll-smooth`} data-theme="light">
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-screen bg-[#F7F7F2] text-[#171914] font-sans flex flex-col antialiased selection:bg-[#C7F36B] selection:text-[#171914] relative">
        {/* Subtle Paper Grain Texture Overlay */}
        <div className="fixed inset-0 pointer-events-none z-[1] opacity-35 bg-noise" aria-hidden="true" />
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

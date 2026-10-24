import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: `${CLUB_NAME} • Official Events & Races`,
  description: `${CLUB_NAME} - ${CLUB_TAGLINE}. Endurance brevets, sunrise pacelines, and community cycling across Anand & Charotar, Gujarat.`,
  keywords: ['Anand Cycling Club', 'Cycling Gujarat', 'Amul cycling', 'Brevets India', 'Charotar cycling', 'Weekend rides Anand'],
  authors: [{ name: 'Anand Cycling Club' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} scroll-smooth dark`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('acc-theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen site-bg text-[#f1f3ee] font-sans flex flex-col antialiased selection:bg-lime-400 selection:text-slate-950">
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

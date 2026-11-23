import { CyclingEvent, EventSponsor } from '@/types';

export const CLUB_NAME = 'THE ANAND CYCLING CLUB';
export const CLUB_TAGLINE = 'Ride with Passion • Explore with Pride';
export const CLUB_LOCATION = 'Vallabh Vidyanagar, Anand, Gujarat, India';
export const CLUB_CONTACT_PHONE = '7043066800';
export const CLUB_CONTACT_EMAIL = 'theanandcyclingclub@gmail.com';

export const DEFAULT_EVENT_SPONSORS: EventSponsor[] = [
  {
    id: 'sponsor-1',
    name: 'Event Partner 1',
    logo_url: '/sponsor1.png'
  },
  {
    id: 'sponsor-2',
    name: 'Event Partner 2',
    logo_url: '/sponsor2.png'
  },
  {
    id: 'sponsor-3',
    name: 'Event Partner 3',
    logo_url: '/sponsor3.png'
  }
];

export const INITIAL_EVENTS: CyclingEvent[] = [];

export function formatINR(paise: number): string {
  const rupees = Math.round(paise / 100);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(rupees);
}

export function formatDateIndian(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatTimeIndian(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  } catch {
    return dateStr;
  }
}

export function getReportingTime(startsAt: string, explicitReportingTime?: string | null): string {
  if (explicitReportingTime && explicitReportingTime.trim() && !explicitReportingTime.includes('05:30 AM IST')) {
    return explicitReportingTime.trim();
  }
  try {
    const d = new Date(startsAt);
    if (!isNaN(d.getTime())) {
      const rep = new Date(d.getTime() - 30 * 60 * 1000);
      return rep.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toUpperCase();
    }
  } catch { }
  return '05:30 AM';
}

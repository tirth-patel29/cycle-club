import { CyclingEvent } from '@/types';

export const CLUB_NAME = 'Anand Cycling Club';
export const CLUB_TAGLINE = 'Ride with Passion • Explore with Pride';
export const CLUB_LOCATION = 'Anand, Gujarat, India';
export const CLUB_CONTACT_PHONE = '+91 98250 12345';
export const CLUB_CONTACT_EMAIL = 'support@anandcyclingclub.in';

export const INITIAL_EVENTS: CyclingEvent[] = [
  {
    id: 'evt-001',
    slug: 'amul-heritage-city-ride-2026',
    title: 'Amul Heritage Sunrise 45K',
    description: 'A brisk, scenic morning ride celebrating the heritage of Anand - the Milk City of India. Perfect for all riders from enthusiastic uncles to seasoned roadies. Route winds through lush Charotar villages, Amul Dairy campus, and the tranquil canal roads.',
    cover_image_url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1600&q=80',
    venue: 'Town Hall Grounds, Near Anand Railway Station',
    location_description: 'Starting from Anand Town Hall, through Bakrol, Mogar, and rolling alongside the Mahi Canal loop.',
    starts_at: '2026-11-08T06:00:00+05:30',
    ends_at: '2026-11-08T09:30:00+05:30',
    distance_km: 45,
    elevation_gain_m: 120,
    difficulty: 'Easy / Leisure',
    registration_fee_paise: 29900, // ₹299
    currency: 'INR',
    status: 'published',
    registration_opens_at: '2026-10-01T00:00:00+05:30',
    registration_closes_at: '2026-11-07T18:00:00+05:30',
    published_at: '2026-10-15T00:00:00+05:30',
    created_at: '2026-10-15T00:00:00+05:30',
    updated_at: '2026-10-15T00:00:00+05:30',
    pace_guide: '18 - 24 km/h (Relaxed & Conversational)',
    reporting_time: '05:30 AM IST',
    flag_off_time: '06:00 AM IST',
    amenities: [
      'Hot Masala Chai & Gujarati Fafda-Jalebi Breakfast',
      'Hydration Points every 12 km (Enerzal, Bananas & Water)',
      'Backup SAG Support Vehicle & Mechanical Assistance',
      'Finisher Medal & Digital E-Certificate',
      'First Aid & Doctor on Call'
    ],
    rules: [
      'Cycling Helmet is strictly MANDATORY for all riders.',
      'Front white headlight and rear red blinker recommended.',
      'Riders below 18 years must have guardian consent.',
      'Obey traffic rules on Charotar highway crossings.'
    ]
  },
  {
    id: 'evt-002',
    slug: 'charotar-green-brevet-100k',
    title: 'Charotar 100K Century Challenge',
    description: 'Test your endurance with our premier 100 km highway and rural tour. Flat, fast tarmac through tobacco and banana plantations of Kheda and Anand districts. Official timing checkpoints with Strava segment verification.',
    cover_image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1600&q=80',
    venue: 'Sardar Patel Memorial, Karamsad, Anand',
    location_description: 'Flag-off at Karamsad, out to Petlad, Borsad bypass, Tarapur highway, and back to Anand.',
    starts_at: '2026-11-22T05:30:00+05:30',
    ends_at: '2026-11-22T11:30:00+05:30',
    distance_km: 100,
    elevation_gain_m: 240,
    difficulty: 'Moderate',
    registration_fee_paise: 59900, // ₹599
    currency: 'INR',
    status: 'published',
    registration_opens_at: '2026-10-01T00:00:00+05:30',
    registration_closes_at: '2026-11-20T23:59:00+05:30',
    published_at: '2026-10-16T00:00:00+05:30',
    created_at: '2026-10-16T00:00:00+05:30',
    updated_at: '2026-10-16T00:00:00+05:30',
    pace_guide: '22 - 30 km/h (Endurance Peloton)',
    reporting_time: '05:00 AM IST',
    flag_off_time: '05:30 AM IST',
    amenities: [
      'Timed RFID / Strava checkpoint bibs',
      'High-energy electrolytes, fruits & energy bars at 3 stations',
      'Full SAG broom wagon for tired riders or bike issues',
      'Exclusive Club Century Finisher Jersey & Brass Medal',
      'Sumptuous post-ride lunch at Karamsad'
    ],
    rules: [
      'Helmets compulsory. No helmet = strictly no flag-off.',
      'Carry minimum 2 water bottles on your bicycle cage.',
      'Cut-off time to finish: 6.5 hours.'
    ]
  },
  {
    id: 'evt-003',
    slug: 'mahi-river-sunset-leisure-ride-25k',
    title: 'Mahi River Sunset Leisure 25K',
    description: 'An easy, family-friendly evening ride to the serene banks of the Mahi River near Umreth. Enjoy sunset over the water, community bonding, and a cool evening breeze. Designed especially for beginner cyclists and senior club members.',
    cover_image_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1600&q=80',
    venue: 'Ganesh Crossing, Vidyanagar Road, Anand',
    location_description: 'Gentle cruise along the university lane, connecting to the canal service road towards the river vantage point.',
    starts_at: '2026-12-06T16:30:00+05:30',
    ends_at: '2026-12-06T19:00:00+05:30',
    distance_km: 25,
    elevation_gain_m: 60,
    difficulty: 'Easy / Leisure',
    registration_fee_paise: 19900, // ₹199
    currency: 'INR',
    status: 'published',
    registration_opens_at: '2026-10-20T00:00:00+05:30',
    registration_closes_at: '2026-12-05T20:00:00+05:30',
    published_at: '2026-10-20T00:00:00+05:30',
    created_at: '2026-10-20T00:00:00+05:30',
    updated_at: '2026-10-20T00:00:00+05:30',
    pace_guide: '14 - 18 km/h (Gentle, All Ages Welcome)',
    reporting_time: '04:00 PM IST',
    flag_off_time: '04:30 PM IST',
    amenities: [
      'Evening high tea with local snacks by the river',
      'Ride Marshals riding alongside to guide beginners',
      'Event Photo album & Souvenir Badge',
      'Complimentary bicycle safety inspection before start'
    ],
    rules: [
      'Helmets compulsory.',
      'Riders of all ages (12+) and bicycle types (even single-speeds) welcome.'
    ]
  },
  {
    id: 'evt-004',
    slug: 'charotar-community-morning-loop-15k',
    title: 'Charotar Community Morning Loop 15K',
    description: 'A complimentary community cycling gathering through the shaded morning avenues of Vallabh Vidyanagar. Zero entry fee, certified route marshals, and complimentary post-ride refreshments for all participants.',
    cover_image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1600&q=80',
    venue: 'Shastri Maidan, Vallabh Vidyanagar, Anand',
    location_description: 'Loop through University Road, Mota Bazaar, and scenic canal lane.',
    starts_at: '2026-12-20T06:30:00+05:30',
    ends_at: '2026-12-20T08:30:00+05:30',
    distance_km: 15,
    elevation_gain_m: 30,
    difficulty: 'Easy / Leisure',
    registration_fee_paise: 0, // FREE
    currency: 'INR',
    status: 'published',
    registration_opens_at: '2026-10-20T00:00:00+05:30',
    registration_closes_at: '2026-12-19T20:00:00+05:30',
    published_at: '2026-10-20T00:00:00+05:30',
    created_at: '2026-10-20T00:00:00+05:30',
    updated_at: '2026-10-20T00:00:00+05:30',
    pace_guide: '12 - 16 km/h (Social & Family Friendly)',
    reporting_time: '06:00 AM IST',
    flag_off_time: '06:30 AM IST',
    amenities: [
      'Free community entry for all age groups',
      'Fresh tender coconut water & banana at finish line',
      'Official Club Digital Certificate',
      'First Aid & Support Squad'
    ],
    rules: [
      'Helmets mandatory for all participants.',
      'All bicycles (road, hybrid, MTB, city bikes, gravel) welcome.'
    ]
  }
];

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
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
}

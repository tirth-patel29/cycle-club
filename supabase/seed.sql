-- supabase/seed.sql
-- Seed data for Anand Cycling Club development & staging

INSERT INTO events (
  id, slug, title, description, cover_image_url, venue, location_description,
  starts_at, ends_at, distance_km, elevation_gain_m, difficulty,
  registration_fee_paise, currency, status, registration_opens_at, registration_closes_at, published_at
) VALUES 
(
  'e0000000-0000-0000-0000-000000000001',
  'amul-heritage-city-ride-2026',
  'Amul Heritage Sunrise 45K',
  'A brisk, scenic morning ride celebrating the heritage of Anand - the Milk City of India. Perfect for all riders from enthusiastic uncles to seasoned roadies. Route winds through lush Charotar villages, Amul Dairy campus, and the tranquil canal roads.',
  'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1600&q=80',
  'Town Hall Grounds, Near Anand Railway Station',
  'Starting from Anand Town Hall, through Bakrol, Mogar, and rolling alongside the Mahi Canal loop.',
  '2026-11-08 06:00:00+05:30',
  '2026-11-08 09:30:00+05:30',
  45,
  120,
  'Easy / Leisure',
  29900,
  'INR',
  'published',
  '2026-10-01 00:00:00+05:30',
  '2026-11-07 18:00:00+05:30',
  '2026-10-15 00:00:00+05:30'
),
(
  'e0000000-0000-0000-0000-000000000002',
  'charotar-green-brevet-100k',
  'Charotar 100K Century Challenge',
  'Test your endurance with our premier 100 km highway and rural tour. Flat, fast tarmac through tobacco and banana plantations of Kheda and Anand districts. Official timing checkpoints with Strava segment verification.',
  'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1600&q=80',
  'Sardar Patel Memorial, Karamsad, Anand',
  'Flag-off at Karamsad, out to Petlad, Borsad bypass, Tarapur highway, and back to Anand.',
  '2026-11-22 05:30:00+05:30',
  '2026-11-22 11:30:00+05:30',
  100,
  240,
  'Moderate',
  59900,
  'INR',
  'published',
  '2026-10-01 00:00:00+05:30',
  '2026-11-20 23:59:00+05:30',
  '2026-10-16 00:00:00+05:30'
),
(
  'e0000000-0000-0000-0000-000000000003',
  'mahi-river-sunset-leisure-ride-25k',
  'Mahi River Sunset Leisure 25K',
  'An easy, family-friendly evening ride to the serene banks of the Mahi River near Umreth. Enjoy sunset over the water, community bonding, and a cool evening breeze. Designed especially for beginner cyclists and senior club members.',
  'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1600&q=80',
  'Ganesh Crossing, Vidyanagar Road, Anand',
  'Gentle cruise along the university lane, connecting to the canal service road towards the river vantage point.',
  '2026-12-06 16:30:00+05:30',
  '2026-12-06 19:00:00+05:30',
  25,
  60,
  'Easy / Leisure',
  19900,
  'INR',
  'published',
  '2026-10-20 00:00:00+05:30',
  '2026-12-05 20:00:00+05:30',
  '2026-10-20 00:00:00+05:30'
)
ON CONFLICT (slug) DO NOTHING;

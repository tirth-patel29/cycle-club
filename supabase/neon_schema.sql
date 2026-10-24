-- ==============================================================================
-- ANAND CYCLING CLUB (ACC) — NEON POSTGRESQL PRODUCTION SCHEMA & SEED DATA
-- Target: Neon Serverless Postgres
-- ==============================================================================

-- 1. EXTENSIONS & AUTH SCHEMA SHIM
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ADMIN ROLES TABLE
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'event_manager')),
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, role)
);

-- 4. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  venue TEXT NOT NULL,
  location_description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  distance_km NUMERIC NOT NULL CHECK (distance_km > 0),
  elevation_gain_m NUMERIC NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy / Leisure', 'Moderate', 'Challenging', 'Endurance / Brevet')),
  registration_fee_paise BIGINT NOT NULL CHECK (registration_fee_paise >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  registration_opens_at TIMESTAMPTZ NOT NULL,
  registration_closes_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. REGISTRATIONS TABLE (With 5 Canonical Bicycle Types)
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_reference TEXT UNIQUE NOT NULL,
  rider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL CHECK (length(mobile_number) >= 10),
  email TEXT,
  age INTEGER NOT NULL CHECK (age >= 12 AND age <= 100),
  gender TEXT NOT NULL,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  jersey_size TEXT CHECK (jersey_size IN ('S', 'M', 'L', 'XL', '2XL', 'None')),
  bicycle_type TEXT CHECK (bicycle_type IN ('Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle')),
  bicycle_brand TEXT,
  bicycle_model TEXT,
  terms_accepted_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending_payment', 'confirmed', 'cancelled')),
  amount_due_paise BIGINT NOT NULL CHECK (amount_due_paise >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  idempotency_key UUID UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('demo', 'razorpay')),
  provider_payment_reference TEXT,
  amount_paise BIGINT NOT NULL CHECK (amount_paise >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('initiated', 'succeeded', 'failed', 'refunded')),
  idempotency_key UUID UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. RIDER PROFILES TABLE (Required 5 Bicycle Types)
CREATE TABLE IF NOT EXISTS rider_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL CHECK (length(mobile_number) >= 10),
  bicycle_type TEXT NOT NULL CHECK (bicycle_type IN ('Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle')),
  age INTEGER CHECK (age >= 12 AND age <= 100),
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  bicycle_brand TEXT,
  bicycle_model TEXT,
  tshirt_size TEXT CHECK (tshirt_size IN ('S', 'M', 'L', 'XL', '2XL', 'None')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status_starts_at ON events(status, starts_at);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_public_reference ON registrations(public_reference);
CREATE INDEX IF NOT EXISTS idx_registrations_idempotency_key ON registrations(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_registrations_mobile ON registrations(mobile_number);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_rider_id ON registrations(rider_id);
CREATE INDEX IF NOT EXISTS idx_payments_registration_id ON payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_rider_profiles_mobile ON rider_profiles(mobile_number);
CREATE INDEX IF NOT EXISTS idx_rider_profiles_bicycle_type ON rider_profiles(bicycle_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- 10. SEED EVENTS (INCLUDING FREE EVENT)
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
  '2026-10-01 00:00:00+05:30',
  '2026-12-05 18:00:00+05:30',
  '2026-10-18 00:00:00+05:30'
),
(
  'e0000000-0000-0000-0000-000000000004',
  'charotar-community-morning-loop-15k',
  'Charotar Community Morning Loop 15K',
  'A complimentary, inclusive community loop designed for families, youth, and new cyclists exploring the milk capital. Free entry with hydration stations and finisher digital bib.',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1600&q=80',
  'Anand Agricultural University (AAU) Gate, Anand',
  'Starting from AAU Gate, through Hadgood village lane, and looping back to university sports ground.',
  '2026-12-20 06:30:00+05:30',
  '2026-12-20 08:30:00+05:30',
  15,
  30,
  'Easy / Leisure',
  0,
  'INR',
  'published',
  '2026-10-01 00:00:00+05:30',
  '2026-12-19 18:00:00+05:30',
  '2026-10-20 00:00:00+05:30'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  registration_fee_paise = EXCLUDED.registration_fee_paise,
  status = EXCLUDED.status;

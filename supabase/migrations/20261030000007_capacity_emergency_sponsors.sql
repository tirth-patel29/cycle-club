-- Migration 20261030000007: Event Capacity, Rider Emergency Details & Sponsors
-- Target: Neon PostgreSQL

-- 1. Events Table: Add max_capacity (nullable for unlimited) and sponsors JSONB
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER CHECK (max_capacity IS NULL OR max_capacity > 0),
  ADD COLUMN IF NOT EXISTS sponsors JSONB DEFAULT '[]'::jsonb;

-- 2. Registrations Table: Add blood_group, residential_address, and seat_reserved_until
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS blood_group TEXT,
  ADD COLUMN IF NOT EXISTS residential_address TEXT,
  ADD COLUMN IF NOT EXISTS seat_reserved_until TIMESTAMPTZ;

-- 3. Rider Profiles Table: Add safety & emergency prefill fields
ALTER TABLE rider_profiles
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS blood_group TEXT,
  ADD COLUMN IF NOT EXISTS residential_address TEXT;

-- 4. Performance Indexes for Live Capacity Queries and Seat Reservation Expiration
CREATE INDEX IF NOT EXISTS idx_registrations_event_status_reserved 
  ON registrations(event_id, status, seat_reserved_until);

CREATE INDEX IF NOT EXISTS idx_registrations_status_reserved
  ON registrations(status, seat_reserved_until);


-- 20261025000005_neon_auth_and_rider_profiles.sql
-- Neon Auth Integration + Google Sign-In Support + Admin Authorization Indexes

-- 1. ADAPT RIDER PROFILES FOR NEON AUTH & GOOGLE IDENTITIES
-- Allow rider profiles to store email and auth_user_id from Neon Auth
ALTER TABLE rider_profiles ADD COLUMN IF NOT EXISTS auth_user_id TEXT;
ALTER TABLE rider_profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Drop foreign key to auth.users if present, allowing Neon Auth users to persist cleanly
ALTER TABLE rider_profiles DROP CONSTRAINT IF EXISTS rider_profiles_id_fkey;

-- Ensure auth_user_id has a unique index for idempotent upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_rider_profiles_auth_user_id ON rider_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_rider_profiles_email ON rider_profiles(email);

-- 2. ENFORCE BICYCLE TYPE CONSTRAINT (Road, Hybrid, MTB, City Bike, Gravel Cycle)
ALTER TABLE rider_profiles DROP CONSTRAINT IF EXISTS rider_profiles_bicycle_type_check;
ALTER TABLE rider_profiles ADD CONSTRAINT rider_profiles_bicycle_type_check 
  CHECK (bicycle_type IN ('Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle'));

-- 3. ENSURE ADMIN ROLES TABLE HAS APPROPRIATE INDEXES AND CONSTRAINTS
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'event_manager', 'rider')),
  assigned_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_roles_user_role ON admin_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role);

-- 4. ENSURE EVENTS SLUG UNIQUE INDEX & REQUISITE CONSTRAINTS
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status_starts_at ON events(status, starts_at);

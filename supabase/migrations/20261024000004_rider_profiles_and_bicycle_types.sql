-- 20261024000004_rider_profiles_and_bicycle_types.sql
-- Production Rider Profiles and Bicycle Type Constraints

-- 1. RIDER PROFILES TABLE
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

-- 2. EXTEND REGISTRATIONS TABLE
-- Add rider_id foreign key, bicycle_brand, bicycle_model, and align bicycle_type
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS rider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS bicycle_brand TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS bicycle_model TEXT;

-- Drop old constraint if present and enforce 5 canonical bicycle types
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_bicycle_type_check;
ALTER TABLE registrations ADD CONSTRAINT registrations_bicycle_type_check 
  CHECK (bicycle_type IS NULL OR bicycle_type IN ('Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle'));

-- 3. ROW LEVEL SECURITY ON RIDER PROFILES
ALTER TABLE rider_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view their own profile
CREATE POLICY "Riders can view own profile"
ON rider_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy: Owners can insert their own profile
CREATE POLICY "Riders can insert own profile"
ON rider_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Policy: Owners can update their own profile
CREATE POLICY "Riders can update own profile"
ON rider_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all rider profiles"
ON rider_profiles FOR SELECT
TO authenticated
USING (is_admin());

-- 4. EXTEND REGISTRATIONS RLS FOR RIDERS
-- Allow authenticated riders to view their own registrations
CREATE POLICY "Riders can view own registrations"
ON registrations FOR SELECT
TO authenticated
USING (rider_id = auth.uid() OR is_admin());

-- Allow authenticated riders or public to insert registration
CREATE POLICY "Users can create event registrations"
ON registrations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_rider_profiles_mobile ON rider_profiles(mobile_number);
CREATE INDEX IF NOT EXISTS idx_rider_profiles_bicycle_type ON rider_profiles(bicycle_type);
CREATE INDEX IF NOT EXISTS idx_registrations_rider_id ON registrations(rider_id);

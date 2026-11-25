-- Migration: Add XS to jersey_size and tshirt_size check constraints
-- Purpose: Support XS size in event registrations and rider profiles

ALTER TABLE public.registrations
  DROP CONSTRAINT IF EXISTS registrations_jersey_size_check;

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_jersey_size_check
  CHECK (jersey_size = ANY (ARRAY['XS'::text, 'S'::text, 'M'::text, 'L'::text, 'XL'::text, '2XL'::text, 'None'::text]));

ALTER TABLE public.rider_profiles
  DROP CONSTRAINT IF EXISTS rider_profiles_tshirt_size_check;

ALTER TABLE public.rider_profiles
  ADD CONSTRAINT rider_profiles_tshirt_size_check
  CHECK (tshirt_size = ANY (ARRAY['XS'::text, 'S'::text, 'M'::text, 'L'::text, 'XL'::text, '2XL'::text, 'None'::text]));

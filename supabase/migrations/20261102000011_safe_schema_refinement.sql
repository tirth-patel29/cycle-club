-- ==============================================================================
-- ANAND CYCLING CLUB (ACC) — SAFE DATABASE REFINEMENT (OPTION B)
-- Migration: 20261102000011_safe_schema_refinement.sql
-- Target: Neon Serverless Postgres
-- Description:
--   1. Adds foreign key constraint linking registrations(rider_id) -> rider_profiles(id)
--      with ON DELETE SET NULL to preserve historical registrations if a profile is deleted.
--   2. Adds composite index idx_registrations_rider_created on (rider_id, created_at DESC)
--      for sorted rider registration history lookups without an in-memory Sort step.
--   3. Adds composite index idx_payments_reg_status on (registration_id, status)
--      for instant Razorpay reconciliation and payment lookups.
-- NOTE:
--   - Does NOT add (event_id, status) index because idx_registrations_event_status_reserved
--     (event_id, status, seat_reserved_until) already covers (event_id, status) as its leading prefix.
--   - Keeps legacy public.profiles untouched per explicit instructions.
--   - Contains ZERO destructive operations (no drops, no truncates, no deletes).
-- ==============================================================================

BEGIN;

-- 1. FOREIGN KEY CONSTRAINT: registrations.rider_id -> rider_profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_registrations_rider_profile' 
      AND table_name = 'registrations'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.registrations
      ADD CONSTRAINT fk_registrations_rider_profile
      FOREIGN KEY (rider_id) 
      REFERENCES public.rider_profiles(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- 2. COMPOSITE INDEX: Rider Registration History Lookups (Sorted)
CREATE INDEX IF NOT EXISTS idx_registrations_rider_created 
  ON public.registrations(rider_id, created_at DESC);

-- 3. COMPOSITE INDEX: Payment Reconciliation Lookups
CREATE INDEX IF NOT EXISTS idx_payments_reg_status 
  ON public.payments(registration_id, status);

COMMIT;

-- ==============================================================================
-- ANAND CYCLING CLUB (ACC) — EVENT ANNOUNCEMENT POSTER POPUP MIGRATION
-- Migration: 20261102000012_event_announcement_poster_popup.sql
-- Target: Neon Serverless Postgres
-- Description:
--   1. Adds poster_url for event announcement poster images.
--   2. Adds is_popup_active boolean flag (default false).
--   3. Adds poster_redirect_url for custom modal CTA redirection.
--   4. Creates a partial unique index ensuring AT MOST ONE event can have an
--      active announcement popup globally across the database.
-- ==============================================================================

BEGIN;

-- 1. ADD COLUMNS
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS poster_url TEXT,
  ADD COLUMN IF NOT EXISTS is_popup_active BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS poster_redirect_url TEXT;

-- 2. PARTIAL UNIQUE INDEX: Strictly enforces single active popup globally
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_single_active_popup 
  ON public.events (is_popup_active) 
  WHERE is_popup_active = true;

COMMIT;


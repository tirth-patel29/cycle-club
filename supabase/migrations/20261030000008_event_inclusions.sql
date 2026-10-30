-- Migration 08: Add event inclusions JSONB column
-- Allows custom per-event inclusions (e.g., Stay at hotel, Cruise with dinner, Bicycle transport, Nutrition on course, Cycling jersey)
ALTER TABLE events ADD COLUMN IF NOT EXISTS inclusions JSONB DEFAULT '[]'::jsonb;


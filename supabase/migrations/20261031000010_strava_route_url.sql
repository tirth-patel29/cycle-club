-- Migration 10: Add strava_route_url to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS strava_route_url TEXT;


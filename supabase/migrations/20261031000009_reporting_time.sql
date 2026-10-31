-- Migration 09: Add reporting_time to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS reporting_time TEXT;


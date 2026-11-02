import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(dbUrl);

async function applyMigration() {
  console.log('Applying Migration 20261102000012_event_announcement_poster_popup.sql...');
  const migrationSql = fs.readFileSync('supabase/migrations/20261102000012_event_announcement_poster_popup.sql', 'utf8');

  // Neon serverless query runs single statements or we can execute DDL commands:
  await sql`ALTER TABLE public.events ADD COLUMN IF NOT EXISTS poster_url TEXT`;
  await sql`ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_popup_active BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE public.events ADD COLUMN IF NOT EXISTS poster_redirect_url TEXT`;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_events_single_active_popup 
    ON public.events (is_popup_active) 
    WHERE is_popup_active = true
  `;

  console.log('Migration 12 applied successfully!');

  // Verify columns
  const cols = await sql`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'events' AND column_name IN ('poster_url', 'is_popup_active', 'poster_redirect_url')
  `;
  console.log('Verified columns in events table:');
  console.log(cols);

  // Verify index
  const idx = await sql`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'events' AND indexname = 'idx_events_single_active_popup'
  `;
  console.log('Verified partial unique index:');
  console.log(idx);
}

applyMigration().catch(err => {
  console.error('Migration 12 failed:', err);
  process.exit(1);
});


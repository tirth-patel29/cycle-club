import pg from 'pg';
import fs from 'fs';

function loadEnv(file) {
  if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv('.env.local');
loadEnv('.env');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.log('No DATABASE_URL found. Skipping live DB migration (running in offline/mock mode).');
  process.exit(0);
}

async function run() {
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Neon PostgreSQL to apply migration 09 (reporting_time)...');
    await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS reporting_time TEXT;');
    console.log('Successfully applied migration 09: added reporting_time column to events table.');
  } catch (err) {
    console.error('Error applying migration 09:', err);
  } finally {
    await pool.end();
  }
}

run();


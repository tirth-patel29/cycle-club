import pg from 'pg';
import fs from 'fs';
import path from 'path';

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
    const sqlPath = path.resolve('supabase/migrations/20261030000008_event_inclusions.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('Applying migration 20261030000008 to Neon DB...');
    await pool.query(sqlContent);
    console.log('✓ Migration applied successfully!');

    const evCols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position;
    `);
    console.log('\nUpdated events columns:', evCols.rows.map(c => `${c.column_name} (${c.data_type})`));
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();

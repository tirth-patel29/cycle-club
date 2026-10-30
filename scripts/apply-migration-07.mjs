import pg from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function run() {
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const sqlPath = path.resolve('supabase/migrations/20261030000007_capacity_emergency_sponsors.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('Applying migration 20261030000007 to Neon DB...');
    await pool.query(sqlContent);
    console.log('✓ Migration applied successfully!');

    // Verify events columns
    const evCols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position;
    `);
    console.log('\nUpdated events columns:', evCols.rows.map(c => `${c.column_name} (${c.data_type})`));

    // Verify registrations columns
    const regCols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'registrations'
      ORDER BY ordinal_position;
    `);
    console.log('\nUpdated registrations columns:', regCols.rows.map(c => `${c.column_name} (${c.data_type})`));

    // Verify rider_profiles columns
    const profCols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'rider_profiles'
      ORDER BY ordinal_position;
    `);
    console.log('\nUpdated rider_profiles columns:', profCols.rows.map(c => `${c.column_name} (${c.data_type})`));

  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();


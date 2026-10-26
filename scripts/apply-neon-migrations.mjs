import pg from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function migrate() {
  console.log('Connecting to Neon PostgreSQL...');
  const pool = new pg.Pool({ connectionString });

  try {
    const sqlPath = path.resolve('supabase/neon_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying Neon schema and seed data...');
    await pool.query(sqlContent);
    console.log('✓ Successfully applied schema & initial seed data to Neon DB!');

    // Verify tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nCreated Tables in Public Schema:');
    for (const row of tables.rows) {
      console.log(` - ${row.table_name}`);
    }

    // Verify events
    const events = await pool.query('SELECT slug, title, registration_fee_paise, status FROM events ORDER BY starts_at;');
    console.log('\nSeeded Events:');
    for (const ev of events.rows) {
      console.log(` - [${ev.status.toUpperCase()}] ${ev.title} (Fee: ₹${ev.registration_fee_paise / 100})`);
    }
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

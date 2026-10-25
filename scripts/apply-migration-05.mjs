import pg from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ASeXmfdZ42PK@ep-billowing-sunset-az44yy0j-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function run() {
  const pool = new pg.Pool({ connectionString });
  try {
    const sqlPath = path.resolve('supabase/migrations/20261025000005_neon_auth_and_rider_profiles.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('Applying migration 20261025000005 to Neon DB...');
    await pool.query(sqlContent);
    console.log('✓ Migration applied successfully!');

    const cols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'rider_profiles'
      ORDER BY ordinal_position;
    `);
    console.log('Updated rider_profiles columns:', cols.rows.map(c => `${c.column_name} (${c.data_type})`));
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();

import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ASeXmfdZ42PK@ep-billowing-sunset-az44yy0j-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function inspect() {
  const pool = new pg.Pool({ connectionString });
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'rider_profiles'
      ORDER BY ordinal_position;
    `);
    console.log('RIDER_PROFILES COLUMNS:', res.rows);
    const rpConstraints = await pool.query(`
      SELECT conname, contype, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'rider_profiles';
    `);
    console.log('RIDER_PROFILES CONSTRAINTS:', rpConstraints.rows);

    const tables = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'neon_auth')
      ORDER BY table_schema, table_name;
    `);
    console.log('ALL TABLES:', tables.rows);

    const adminRolesCols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'admin_roles'
      ORDER BY ordinal_position;
    `);
    console.log('ADMIN_ROLES COLUMNS:', adminRolesCols.rows);
  } catch (err) {
    console.error('Inspection error:', err);
  } finally {
    await pool.end();
  }
}

inspect();

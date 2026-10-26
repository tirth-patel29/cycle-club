import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function testConnection() {
  const pool = new pg.Pool({ connectionString });
  try {
    const res = await pool.query('SELECT version(), current_database(), current_user;');
    console.log('Successfully connected to Neon PostgreSQL!');
    console.log('Result:', res.rows[0]);

    const tablesRes = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name;
    `);
    console.log('Existing tables in Neon DB:', tablesRes.rows);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await pool.end();
  }
}

testConnection();

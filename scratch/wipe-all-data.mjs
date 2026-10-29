/**
 * Full data reset: wipe ALL registrations and payments.
 * Keeps events untouched (published).
 */
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query('BEGIN');

  const pay = await client.query('DELETE FROM payments RETURNING id');
  console.log(`Deleted ${pay.rowCount} payments.`);

  const reg = await client.query('DELETE FROM registrations RETURNING id');
  console.log(`Deleted ${reg.rowCount} registrations.`);

  const evtCount = await client.query('SELECT COUNT(*) FROM events');
  console.log(`Events remaining: ${evtCount.rows[0].count} (untouched)`);

  await client.query('COMMIT');
  console.log('\n✅ All registrations and payments wiped. Fresh start.');
} catch (e) {
  await client.query('ROLLBACK');
  console.error('❌ Error, rolled back:', e.message);
} finally {
  client.release();
  await pool.end();
}

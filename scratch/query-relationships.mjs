import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });

async function queryRelationships() {
  try {
    const eventStats = await pool.query(`
      SELECT e.id, e.title, e.slug, e.status, e.starts_at, e.created_at,
             COUNT(r.id) AS reg_count
      FROM events e
      LEFT JOIN registrations r ON r.event_id = e.id
      GROUP BY e.id, e.title, e.slug, e.status, e.starts_at, e.created_at
      ORDER BY e.created_at DESC;
    `);
    console.log('--- EVENT STATS ---');
    console.table(eventStats.rows);

    const userCount = await pool.query(`SELECT count(*) FROM neon_auth.user`);
    console.log('neon_auth.user count:', userCount.rows[0].count);

    const profileCount = await pool.query(`SELECT count(*) FROM rider_profiles`);
    console.log('rider_profiles count:', profileCount.rows[0].count);

    const regCount = await pool.query(`SELECT count(*) FROM registrations`);
    console.log('registrations count:', regCount.rows[0].count);

    const payCount = await pool.query(`SELECT count(*) FROM payments`);
    console.log('payments count:', payCount.rows[0].count);

    const emailCount = await pool.query(`SELECT count(*) FROM email_deliveries`);
    console.log('email_deliveries count:', emailCount.rows[0].count);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

queryRelationships();

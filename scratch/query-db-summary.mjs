import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });

async function queryData() {
  try {
    const events = await pool.query(`
      SELECT id, title, slug, status, starts_at, created_at, cover_image_url
      FROM events
      ORDER BY created_at DESC;
    `);
    console.log('--- EVENTS (' + events.rows.length + ') ---');
    console.log(JSON.stringify(events.rows, null, 2));

    const registrations = await pool.query(`
      SELECT id, event_id, full_name, email, public_reference, status, created_at
      FROM registrations
      ORDER BY created_at DESC;
    `);
    console.log('--- REGISTRATIONS (' + registrations.rows.length + ') ---');
    console.log(JSON.stringify(registrations.rows, null, 2));

    const payments = await pool.query(`
      SELECT id, registration_id, amount_paise, status, razorpay_order_id, razorpay_payment_id, created_at
      FROM payments
      ORDER BY created_at DESC;
    `);
    console.log('--- PAYMENTS (' + payments.rows.length + ') ---');
    console.log(JSON.stringify(payments.rows, null, 2));

    const users = await pool.query(`
      SELECT id, email, name, role, created_at
      FROM neon_auth.user
      ORDER BY created_at DESC;
    `);
    console.log('--- NEON_AUTH USERS (' + users.rows.length + ') ---');
    console.log(JSON.stringify(users.rows, null, 2));

    const emailDeliveries = await pool.query(`
      SELECT id, recipient_email, template_type, status, created_at
      FROM email_deliveries
      ORDER BY created_at DESC;
    `);
    console.log('--- EMAIL DELIVERIES (' + emailDeliveries.rows.length + ') ---');
    console.log(JSON.stringify(emailDeliveries.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

queryData();

import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const evRes = await pool.query("SELECT id, title, status, registration_fee_paise FROM events WHERE status = 'published' LIMIT 1");
console.log('Event:', evRes.rows[0]?.title, '| Fee paise:', evRes.rows[0]?.registration_fee_paise);

const payRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'payments' ORDER BY ordinal_position");
console.log('Payment cols:', payRes.rows.map(r => r.column_name).join(', '));

const regRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'registrations' ORDER BY ordinal_position");
console.log('Reg cols:', regRes.rows.map(r => r.column_name).join(', '));

const pendRes = await pool.query("SELECT r.public_reference, r.status, COUNT(p.id) as pay_count FROM registrations r LEFT JOIN payments p ON p.registration_id = r.id GROUP BY r.public_reference, r.status");
console.log('Registrations:', pendRes.rows);

console.log('PAYMENT_PROVIDER:', process.env.PAYMENT_PROVIDER || '(not set -> demo)');
console.log('RESEND_API_KEY set:', !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_placeholder'));

await pool.end();

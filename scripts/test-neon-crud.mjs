import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function testCrud() {
  const pool = new pg.Pool({ connectionString });
  try {
    console.log('1. Querying events from Neon:');
    const events = await pool.query('SELECT slug, title, registration_fee_paise FROM events LIMIT 2');
    console.log(events.rows);

    console.log('\n2. Testing registration insert with canonical bicycle type (Gravel Cycle):');
    const testRef = `ACC-2026-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const idempKey = 'a0000000-0000-0000-0000-' + String(Date.now()).slice(-12);

    const insertRes = await pool.query(`
      INSERT INTO registrations (
        public_reference, event_id, full_name, mobile_number, email, age, gender,
        bicycle_type, bicycle_brand, bicycle_model, jersey_size,
        terms_accepted_at, status, amount_due_paise, currency, idempotency_key
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING *;
    `, [
      testRef,
      'e0000000-0000-0000-0000-000000000001',
      'Karan Mehta',
      '9825012345',
      'karan@example.com',
      32,
      'Male',
      'Gravel Cycle',
      'Cannondale',
      'Topstone',
      'L',
      new Date().toISOString(),
      'confirmed',
      29900,
      'INR',
      idempKey
    ]);

    console.log('Inserted registration:', insertRes.rows[0].public_reference, insertRes.rows[0].bicycle_type);

    console.log('\n3. Testing canonical bicycle type check constraint rejection (invalid: "Hoverboard"):');
    try {
      await pool.query(`
        INSERT INTO registrations (
          public_reference, event_id, full_name, mobile_number, age, gender,
          bicycle_type, terms_accepted_at, status, amount_due_paise, currency, idempotency_key
        ) VALUES (
          'FAIL-TEST', 'e0000000-0000-0000-0000-000000000001', 'Fail Rider', '9825000000', 25, 'Male',
          'Hoverboard', NOW(), 'confirmed', 0, 'INR', gen_random_uuid()
        );
      `);
      console.error('Constraint failed to reject invalid bicycle type!');
    } catch (err) {
      console.log('✓ Successfully caught constraint violation as expected:', err.message);
    }

    // Clean up test registration
    await pool.query('DELETE FROM registrations WHERE public_reference = $1', [testRef]);
    console.log('\n✓ Cleaned up test record.');
  } finally {
    await pool.end();
  }
}

testCrud().catch(console.error);

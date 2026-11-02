import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('ERROR: DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(dbUrl);

async function runTestMigration() {
  console.log('--- Starting Migration Sandbox Test (Zero Production Impact) ---');
  const sandbox = 'test_migration_sandbox';

  try {
    // 1. Clean up old sandbox if any
    await sql.query(`DROP SCHEMA IF EXISTS "${sandbox}" CASCADE`);
    await sql.query(`CREATE SCHEMA "${sandbox}"`);
    console.log(`[1/5] Created isolated sandbox schema: ${sandbox}`);

    // 2. Clone tables from public with exact structures
    await sql.query(`CREATE TABLE "${sandbox}".events (LIKE public.events INCLUDING ALL)`);
    await sql.query(`CREATE TABLE "${sandbox}".rider_profiles (LIKE public.rider_profiles INCLUDING ALL)`);
    await sql.query(`CREATE TABLE "${sandbox}".registrations (LIKE public.registrations INCLUDING ALL)`);
    await sql.query(`CREATE TABLE "${sandbox}".payments (LIKE public.payments INCLUDING ALL)`);

    // Copy production data
    await sql.query(`INSERT INTO "${sandbox}".events SELECT * FROM public.events`);
    await sql.query(`INSERT INTO "${sandbox}".rider_profiles SELECT * FROM public.rider_profiles`);
    await sql.query(`INSERT INTO "${sandbox}".registrations SELECT * FROM public.registrations`);
    await sql.query(`INSERT INTO "${sandbox}".payments SELECT * FROM public.payments`);
    console.log('[2/5] Cloned production tables and inserted existing records into sandbox.');

    // 3. Test applying the migration in the sandbox
    console.log('[3/5] Applying proposed migration to sandbox...');
    await sql.query(`
      ALTER TABLE "${sandbox}".registrations 
        ADD CONSTRAINT fk_registrations_rider_profile 
        FOREIGN KEY (rider_id) REFERENCES "${sandbox}".rider_profiles(id) 
        ON DELETE SET NULL
    `);

    await sql.query(`
      CREATE INDEX idx_sandbox_registrations_rider_created 
        ON "${sandbox}".registrations(rider_id, created_at DESC)
    `);

    await sql.query(`
      CREATE INDEX idx_sandbox_payments_reg_status 
        ON "${sandbox}".payments(registration_id, status)
    `);
    console.log('  ✓ Migration executed successfully in sandbox.');

    // 4. Test Foreign Key Behavioral Guarantees
    console.log('[4/5] Testing constraint behaviors...');

    // Test A: Null rider_id (Guest checkout) must succeed
    const testGuestId = '00000000-0000-0000-0000-000000000001';
    const ev = (await sql.query(`SELECT id FROM "${sandbox}".events LIMIT 1`))[0];
    await sql.query(`
      INSERT INTO "${sandbox}".registrations (
        id, public_reference, rider_id, event_id, full_name, mobile_number, email, age, gender,
        terms_accepted_at, status, amount_due_paise, currency, idempotency_key
      ) VALUES (
        $1, 'ACC-TEST-GUEST', NULL, $2, 'Guest Rider', '9825111111', 'guest@example.in', 30, 'Male',
        NOW(), 'pending_payment', 0, 'INR', 'a0000000-0000-0000-0000-000000000001'
      )
    `, [testGuestId, ev.id]);
    console.log('  ✓ Null rider_id allowed (guest registration preserved).');

    // Test B: Invalid rider_id must fail closed
    let threwFkError = false;
    try {
      await sql.query(`
        INSERT INTO "${sandbox}".registrations (
          id, public_reference, rider_id, event_id, full_name, mobile_number, email, age, gender,
          terms_accepted_at, status, amount_due_paise, currency, idempotency_key
        ) VALUES (
          '00000000-0000-0000-0000-000000000002', 'ACC-TEST-FAIL', 'ffffffff-ffff-ffff-ffff-ffffffffffff', $1, 'Fake Rider', '9825111111', 'fake@example.in', 30, 'Male',
          NOW(), 'pending_payment', 0, 'INR', 'a0000000-0000-0000-0000-000000000002'
        )
      `, [ev.id]);
    } catch (err) {
      threwFkError = err.code === '23503'; // foreign_key_violation
    }
    if (!threwFkError) throw new Error('Foreign key failed to reject non-existent rider_id!');
    console.log('  ✓ Invalid rider_id correctly rejected with foreign_key_violation (code 23503).');

    // Test C: Valid rider_id succeeds
    const profile = (await sql.query(`SELECT id FROM "${sandbox}".rider_profiles LIMIT 1`))[0];
    await sql.query(`
      INSERT INTO "${sandbox}".registrations (
        id, public_reference, rider_id, event_id, full_name, mobile_number, email, age, gender,
        terms_accepted_at, status, amount_due_paise, currency, idempotency_key
      ) VALUES (
        '00000000-0000-0000-0000-000000000003', 'ACC-TEST-VALID', $1, $2, 'Valid Rider', '9825111111', 'valid@example.in', 30, 'Male',
        NOW(), 'pending_payment', 0, 'INR', 'a0000000-0000-0000-0000-000000000003'
      )
    `, [profile.id, ev.id]);
    console.log('  ✓ Valid rider_id successfully inserted and linked.');

    // Test D: ON DELETE SET NULL preserves the registration when rider is deleted
    await sql.query(`DELETE FROM "${sandbox}".rider_profiles WHERE id = $1`, [profile.id]);
    const preservedReg = (await sql.query(`SELECT id, rider_id, public_reference FROM "${sandbox}".registrations WHERE id = '00000000-0000-0000-0000-000000000003'`))[0];
    if (!preservedReg || preservedReg.rider_id !== null) {
      throw new Error('Registration was deleted or rider_id was not set to NULL!');
    }
    console.log(`  ✓ ON DELETE SET NULL verified: Registration ${preservedReg.public_reference} preserved with rider_id set to NULL.`);

    // 5. Clean up sandbox
    await sql.query(`DROP SCHEMA "${sandbox}" CASCADE`);
    console.log('[5/5] Cleaned up sandbox schema.');

    console.log('\n======================================================');
    console.log('MIGRATION TEST SUITE PASSED WITH 100% SUCCESS');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Migration test failed:', err);
    try {
      await sql.query(`DROP SCHEMA IF EXISTS "${sandbox}" CASCADE`);
    } catch (_) {}
    process.exit(1);
  }
}

runTestMigration();

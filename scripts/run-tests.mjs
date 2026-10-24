import assert from 'assert';
import {
  normalizeIndianMobile,
  INDIAN_MOBILE_REGEX,
  registrationSchema,
  bicycleTypeSchema,
  BICYCLE_TYPES,
  riderProfileSchema
} from '../src/lib/validations/registration';
import { db, sanitizeCsvCell } from '../src/lib/db';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function runAll() {
  console.log(`\n================ Running Production Verification Test Suite ================`);

  // 1. Mobile Normalization
  console.log(`\n[Suite 1: Mobile Normalization & Validation]`);
  test('normalizes mobile numbers with +91, spaces, dashes', () => {
    assert.strictEqual(normalizeIndianMobile('+91 98250 12345'), '9825012345');
    assert.strictEqual(normalizeIndianMobile('09825012345'), '9825012345');
    assert.strictEqual(normalizeIndianMobile('919825012345'), '9825012345');
    assert.strictEqual(normalizeIndianMobile('98250-12345'), '9825012345');
  });

  test('validates 10-digit Indian numbers starting with 6, 7, 8, or 9', () => {
    assert.strictEqual(INDIAN_MOBILE_REGEX.test('9825012345'), true);
    assert.strictEqual(INDIAN_MOBILE_REGEX.test('8825012345'), true);
    assert.strictEqual(INDIAN_MOBILE_REGEX.test('7825012345'), true);
    assert.strictEqual(INDIAN_MOBILE_REGEX.test('6825012345'), true);
    assert.strictEqual(INDIAN_MOBILE_REGEX.test('5825012345'), false);
    assert.strictEqual(INDIAN_MOBILE_REGEX.test('12345'), false);
  });

  // 2. Canonical Bicycle Types
  console.log(`\n[Suite 2: Canonical 5 Bicycle Types Enforcement]`);
  test('strictly validates all five approved bicycle types', () => {
    const requiredTypes = ['Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle'];
    assert.deepStrictEqual(Array.from(BICYCLE_TYPES), requiredTypes);

    for (const type of requiredTypes) {
      const res = bicycleTypeSchema.safeParse(type);
      assert.strictEqual(res.success, true);
    }
  });

  test('rejects unapproved or invalid bicycle types at schema boundary', () => {
    const invalidTypes = ['Electric Scooter', 'Fixie', 'Cruiser', 'BMX', 'Road Bike', ''];
    for (const invalid of invalidTypes) {
      const res = bicycleTypeSchema.safeParse(invalid);
      assert.strictEqual(res.success, false);
    }
  });

  // 3. Rider Profile Lifecycle
  console.log(`\n[Suite 3: Rider Profile Lifecycle & Decoupled Event Overrides]`);
  const testUserId = 'test-rider-prod-001';
  await db.upsertRiderProfile(testUserId, {
    full_name: 'Harshil Shah',
    mobile_number: '9825099887',
    bicycle_type: 'Road',
    bicycle_brand: 'Trek',
    bicycle_model: 'Domane AL 2',
    age: 29,
    gender: 'Male',
    tshirt_size: 'L'
  });

  await testAsync('persists and retrieves rider profile with bicycle specs', async () => {
    const profile = await db.getRiderProfile(testUserId);
    assert.ok(profile);
    assert.strictEqual(profile.full_name, 'Harshil Shah');
    assert.strictEqual(profile.bicycle_type, 'Road');
    assert.strictEqual(profile.bicycle_brand, 'Trek');
  });

  await testAsync('event-specific bicycle choice does not overwrite permanent profile', async () => {
    // Rider chooses MTB for this specific event
    const reg = await db.createRegistration({
      event_id: 'evt-002',
      event_title: 'Mahi River Canal Century 100K',
      rider_id: testUserId,
      full_name: 'Harshil Shah',
      mobile_number: '9825099887',
      age: 29,
      gender: 'Male',
      bicycle_type: 'MTB',
      bicycle_brand: 'Scott',
      bicycle_model: 'Aspect 950',
      jersey_size: 'L',
      terms_accepted_at: new Date().toISOString(),
      status: 'pending_payment',
      amount_due_paise: 49900,
      currency: 'INR',
      idempotency_key: 'idemp-decoupled-test-01'
    });

    assert.strictEqual(reg.bicycle_type, 'MTB');
    // Permanent profile remains Road
    const profile = await db.getRiderProfile(testUserId);
    assert.strictEqual(profile?.bicycle_type, 'Road');
  });

  await testAsync('profile updates do not silently alter past registrations', async () => {
    // Rider changes permanent profile to Gravel Cycle
    await db.upsertRiderProfile(testUserId, {
      bicycle_type: 'Gravel Cycle'
    });
    const profile = await db.getRiderProfile(testUserId);
    assert.strictEqual(profile?.bicycle_type, 'Gravel Cycle');

    // Historical registration retains its original snapshot (MTB)
    const registrations = await db.getRegistrations({ riderId: testUserId });
    assert.ok(registrations.length > 0);
    assert.strictEqual(registrations[0].bicycle_type, 'MTB');
  });

  // 4. Free Events Flow
  console.log(`\n[Suite 4: Free Events Instant Confirmation (₹0 / No Fake Payment)]`);
  await testAsync('instantly confirms free event with zero paise and no payment record', async () => {
    const freeReg = await db.createRegistration({
      event_id: 'evt-004',
      event_title: 'Charotar Community Morning Loop 15K',
      rider_id: testUserId,
      full_name: 'Harshil Shah',
      mobile_number: '9825099887',
      age: 29,
      gender: 'Male',
      bicycle_type: 'Hybrid',
      jersey_size: 'M',
      terms_accepted_at: new Date().toISOString(),
      status: 'pending_payment',
      amount_due_paise: 0,
      currency: 'INR',
      idempotency_key: 'idemp-free-test-01'
    });

    assert.strictEqual(freeReg.amount_due_paise, 0);
    assert.strictEqual(freeReg.status, 'confirmed');
    assert.match(freeReg.public_reference, /^ACC-\d{4}-[A-Z0-9]+$/);

    const payment = await db.getPaymentByRegistrationId(freeReg.id);
    assert.strictEqual(payment, null);
  });

  // 5. Paid Events Flow & Idempotency
  console.log(`\n[Suite 5: Paid Events Demo Flow & Idempotency]`);
  const idempotencyKey = 'a1b2c3d4-e5f6-7a8b-9c0d-1234567890ab';
  const paidReg = await db.createRegistration({
    event_id: 'evt-001',
    event_title: 'Amul Heritage Sunrise 45K',
    full_name: 'Vikram Sarabhai',
    mobile_number: '9898012345',
    age: 35,
    gender: 'Male',
    bicycle_type: 'Road',
    terms_accepted_at: new Date().toISOString(),
    status: 'pending_payment',
    amount_due_paise: 29900,
    currency: 'INR',
    idempotency_key: idempotencyKey
  });

  test('creates paid registration in pending_payment state', () => {
    assert.match(paidReg.public_reference, /^ACC-\d{4}-[A-Z0-9]+$/);
    assert.strictEqual(paidReg.status, 'pending_payment');
  });

  await testAsync('returns identical record for repeated submission with same idempotency key', async () => {
    const retry = await db.createRegistration({
      event_id: 'evt-001',
      event_title: 'Amul Heritage Sunrise 45K',
      full_name: 'Vikram Sarabhai',
      mobile_number: '9898012345',
      age: 35,
      gender: 'Male',
      bicycle_type: 'Road',
      terms_accepted_at: new Date().toISOString(),
      status: 'pending_payment',
      amount_due_paise: 29900,
      currency: 'INR',
      idempotency_key: idempotencyKey
    });
    assert.strictEqual(retry.id, paidReg.id);
    assert.strictEqual(retry.public_reference, paidReg.public_reference);
  });

  await testAsync('preserves registration as pending when demo payment is simulated as declined', async () => {
    const { registration: failedReg, payment } = await db.processDemoPayment(
      paidReg.public_reference,
      'failure'
    );
    assert.strictEqual(failedReg.status, 'pending_payment');
    assert.strictEqual(payment.status, 'failed');
  });

  await testAsync('transitions registration to confirmed on successful demo retry', async () => {
    const { registration: successReg, payment } = await db.processDemoPayment(
      paidReg.public_reference,
      'success'
    );
    assert.strictEqual(successReg.status, 'confirmed');
    assert.strictEqual(payment.status, 'succeeded');
    assert.match(payment.provider_payment_reference, /DEMO_TXN_/);
  });

  // 6. CSV Formula Injection Protection
  console.log(`\n[Suite 6: CSV Export Security & Formula Injection Defense]`);
  test('escapes =, +, -, @ formula injection characters', () => {
    assert.strictEqual(sanitizeCsvCell('=SUM(A1:A10)'), '"\'=SUM(A1:A10)"');
    assert.strictEqual(sanitizeCsvCell('+cmd|/c calc'), '"\'+cmd|/c calc"');
    assert.strictEqual(sanitizeCsvCell('-100'), '"\'-100"');
    assert.strictEqual(sanitizeCsvCell('@test'), '"\'@test"');
    assert.strictEqual(sanitizeCsvCell('Rajesh Patel'), '"Rajesh Patel"');
  });

  // 7. Admin Metrics
  console.log(`\n[Suite 7: Live Admin Operations Metrics]`);
  await testAsync('calculates authoritative database metrics', async () => {
    const metrics = await db.getAdminMetrics();
    assert.ok(metrics.totalRegs >= 2);
    assert.ok(metrics.confirmedRegs >= 1);
    assert.ok(typeof metrics.totalRevenuePaise === 'number');
  });

  console.log(`\n================ Test Summary ================`);
  console.log(`Total Passed: ${passed}`);
  console.log(`Total Failed: ${failed}`);
  console.log(`==============================================\n`);

  if (failed > 0) process.exit(1);
}

runAll();

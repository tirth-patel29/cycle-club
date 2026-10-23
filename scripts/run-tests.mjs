import assert from 'assert';
import { normalizeIndianMobile, INDIAN_MOBILE_REGEX, registrationSchema } from '../src/lib/validations/registration';
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

async function runAll() {
  console.log(`\n================ Running Unit & Integration Tests ================`);

  console.log(`\n[Suite: Mobile Normalization & Regex]`);
  test('normalizes mobile numbers with +91, spaces, dashes', () => {
    assert.strictEqual(normalizeIndianMobile('+91 98250 12345'), '9825012345');
    assert.strictEqual(normalizeIndianMobile('09825012345'), '9825012345');
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

  console.log(`\n[Suite: Zod Registration Schema Validation]`);
  test('accepts valid participant payload', () => {
    const res = registrationSchema.safeParse({
      event_id: 'evt-001',
      full_name: 'Dineshbhai Patel',
      mobile_number: '+91 98250 54321',
      age: 48,
      gender: 'Male',
      terms_accepted: true,
      idempotency_key: '550e8400-e29b-41d4-a716-446655440000'
    });
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.mobile_number, '9825054321');
    }
  });

  test('rejects age under 12', () => {
    const res = registrationSchema.safeParse({
      event_id: 'evt-001',
      full_name: 'Kid',
      mobile_number: '9825054321',
      age: 10,
      gender: 'Male',
      terms_accepted: true,
      idempotency_key: '550e8400-e29b-41d4-a716-446655440000'
    });
    assert.strictEqual(res.success, false);
  });

  console.log(`\n[Suite: CSV Formula Injection Protection]`);
  test('escapes =, +, -, @ formula injection characters', () => {
    assert.strictEqual(sanitizeCsvCell('=SUM(A1:A10)'), '"\'=SUM(A1:A10)"');
    assert.strictEqual(sanitizeCsvCell('+cmd|/c calc'), '"\'+cmd|/c calc"');
    assert.strictEqual(sanitizeCsvCell('-100'), '"\'-100"');
    assert.strictEqual(sanitizeCsvCell('@test'), '"\'@test"');
    assert.strictEqual(sanitizeCsvCell('Rajesh Patel'), '"Rajesh Patel"');
  });

  console.log(`\n[Suite: Database Idempotency & Demo Payment Transitions]`);
  const idempotencyKey = 'a1b2c3d4-e5f6-7a8b-9c0d-1234567890ab';
  const reg = await db.createRegistration({
    event_id: 'evt-001',
    event_title: 'Amul Heritage Sunrise 45K',
    full_name: 'Vikram Sarabhai',
    mobile_number: '9898012345',
    age: 35,
    gender: 'Male',
    terms_accepted_at: new Date().toISOString(),
    status: 'pending_payment',
    amount_due_paise: 29900,
    currency: 'INR',
    idempotency_key: idempotencyKey
  });

  test('creates registration with public reference ACC-YYYY-XXXX', () => {
    assert.match(reg.public_reference, /^ACC-\d{4}-[A-Z0-9]+$/);
    assert.strictEqual(reg.status, 'pending_payment');
  });

  test('returns identical registration for same idempotency key (idempotent)', async () => {
    const retry = await db.createRegistration({
      event_id: 'evt-001',
      event_title: 'Amul Heritage Sunrise 45K',
      full_name: 'Vikram Sarabhai',
      mobile_number: '9898012345',
      age: 35,
      gender: 'Male',
      terms_accepted_at: new Date().toISOString(),
      status: 'pending_payment',
      amount_due_paise: 29900,
      currency: 'INR',
      idempotency_key: idempotencyKey
    });
    assert.strictEqual(retry.id, reg.id);
    assert.strictEqual(retry.public_reference, reg.public_reference);
  });

  test('atomically updates payment to succeeded and registration to confirmed on demo success', async () => {
    const { registration: updatedReg, payment } = await db.processDemoPayment(
      reg.public_reference,
      'success'
    );
    assert.strictEqual(updatedReg.status, 'confirmed');
    assert.strictEqual(payment.status, 'succeeded');
    assert.match(payment.provider_payment_reference, /DEMO_TXN_/);
  });

  console.log(`\n================ Test Summary ================`);
  console.log(`Total Passed: ${passed}`);
  console.log(`Total Failed: ${failed}`);
  console.log(`==============================================\n`);

  if (failed > 0) process.exit(1);
}

runAll();

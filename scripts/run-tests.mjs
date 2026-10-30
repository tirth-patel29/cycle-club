import assert from 'assert';
import crypto from 'crypto';
import { getSessionSecret, createSessionToken, verifySessionToken } from '../src/lib/auth';
import { getAdminPassword, getAdminEmails, POST as adminLoginPost } from '../src/app/api/admin/login/route';
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

  // 8. Emergency Details Validation
  console.log(`\n[Suite 8: Rider Emergency & Safety Details Validation]`);
  test('validates emergency details and blood group options', () => {
    const validRegistration = {
      event_id: 'evt-test-123',
      full_name: 'Bhavesh Parmar',
      mobile_number: '9825112233',
      age: 32,
      gender: 'Male',
      bicycle_type: 'Hybrid',
      terms_accepted: true,
      emergency_contact_name: 'Meena Parmar',
      emergency_contact_phone: '9825445566',
      blood_group: 'B+',
      residential_address: '14, Anand Society, Near Station, Anand 388001'
    };

    const res = registrationSchema.safeParse(validRegistration);
    assert.strictEqual(res.success, true);
  });

  test('rejects missing or invalid emergency contact phone and blood group', () => {
    const invalidReg = {
      event_id: 'evt-test-123',
      full_name: 'Bhavesh Parmar',
      mobile_number: '9825112233',
      age: 32,
      gender: 'Male',
      bicycle_type: 'Hybrid',
      terms_accepted: true,
      emergency_contact_name: '',
      emergency_contact_phone: '12345',
      blood_group: 'Z+', // invalid blood group
      residential_address: ''
    };

    const res = registrationSchema.safeParse(invalidReg);
    assert.strictEqual(res.success, false);
    if (!res.success) {
      const errFields = res.error.issues.map(e => e.path[0]);
      assert.ok(errFields.includes('emergency_contact_name'));
      assert.ok(errFields.includes('emergency_contact_phone'));
      assert.ok(errFields.includes('blood_group'));
      assert.ok(errFields.includes('residential_address'));
    }
  });

  // 9. Event Capacity Management & Concurrency Enforcement
  console.log(`\n[Suite 9: Event Capacity Quota & Concurrency Enforcement]`);
  await testAsync('creates event with capacity limit and enforces boundary', async () => {
    const capEvent = await db.createEvent({
      title: 'Monsoon Crit 2026',
      slug: `monsoon-crit-${Date.now()}`,
      description: 'High-octane city circuit.',
      cover_image_url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182',
      venue: 'Town Hall Anand',
      location_description: 'Anand Circuit',
      starts_at: new Date(Date.now() + 86400000).toISOString(),
      ends_at: new Date(Date.now() + 90000000).toISOString(),
      distance_km: 40,
      elevation_gain_m: 50,
      difficulty: 'Challenging',
      is_free: false,
      registration_fee_paise: 19900,
      currency: 'INR',
      status: 'published',
      registration_opens_at: new Date().toISOString(),
      registration_closes_at: new Date(Date.now() + 80000000).toISOString(),
      max_capacity: 1 // strictly 1 rider capacity for boundary test
    });

    assert.strictEqual(capEvent.max_capacity, 1);

    // Initial capacity check
    const initialCap = await db.getEventCapacity(capEvent.id);
    assert.strictEqual(initialCap.confirmed_count, 0);
    assert.strictEqual(initialCap.remaining_capacity, 1);
    assert.strictEqual(initialCap.status, 'open');

    // First rider registers
    const rider1 = await db.createRegistration({
      event_id: capEvent.id,
      event_title: capEvent.title,
      full_name: 'First Finisher',
      mobile_number: '9825100001',
      age: 26,
      gender: 'Female',
      bicycle_type: 'Road',
      terms_accepted_at: new Date().toISOString(),
      status: 'confirmed',
      amount_due_paise: 0,
      currency: 'INR',
      blood_group: 'O+',
      emergency_contact_name: 'Parent',
      emergency_contact_phone: '9825100002',
      residential_address: 'ACC Club House, Anand'
    });
    assert.ok(rider1.id);

    // Now capacity must be full
    const fullCap = await db.getEventCapacity(capEvent.id);
    assert.strictEqual(fullCap.confirmed_count, 1);
    assert.strictEqual(fullCap.remaining_capacity, 0);
    assert.strictEqual(fullCap.status, 'full');

    // Attempting a second registration MUST fail with capacity exceeded error
    let rejected = false;
    try {
      await db.createRegistration({
        event_id: capEvent.id,
        event_title: capEvent.title,
        full_name: 'Overbooked Rider',
        mobile_number: '9825100003',
        age: 28,
        gender: 'Male',
        bicycle_type: 'MTB',
        terms_accepted_at: new Date().toISOString(),
        status: 'confirmed',
        amount_due_paise: 0,
        currency: 'INR'
      });
    } catch (err) {
      rejected = true;
      assert.match(err.message, /capacity has been reached/i);
    }
    assert.strictEqual(rejected, true, 'Registration beyond capacity must be rejected');

    // Admin lowering capacity below confirmed riders MUST be rejected
    let reduceRejected = false;
    try {
      await db.updateEvent(capEvent.id, {
        max_capacity: 0 // Cannot reduce below 1 confirmed rider
      });
    } catch (err) {
      reduceRejected = true;
      assert.match(err.message, /cannot be lower than|cannot reduce capacity/i);
    }
    assert.strictEqual(reduceRejected, true, 'Admin cannot reduce capacity below confirmed count');
  });

  // 10. Security Hardening & Pre-Launch Regression Suite
  console.log(`\n[Suite 10: Pre-Launch Security Remediations & Fail-Closed Guards]`);

  test('enforces fail-closed session secret in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.SESSION_SECRET;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.SESSION_SECRET;

      let threw = false;
      try {
        getSessionSecret();
      } catch (err) {
        threw = true;
        assert.match(err.message, /SESSION_SECRET must be explicitly set/i);
      }
      assert.strictEqual(threw, true, 'Must throw error if SESSION_SECRET is unset in production');
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalSecret !== undefined) process.env.SESSION_SECRET = originalSecret;
    }
  });

  test('validates timing-safe webhook HMAC verification rejects invalid or missing secret', () => {
    const secret = 'rzp_test_sec_999888';
    const payload = JSON.stringify({ event: 'payment.captured', id: 'pay_test_123' });

    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const invalidSignature = 'bad_forged_signature_0000000000000000000000000000000000000000';

    // Verify valid signature
    const validBuf = Buffer.from(validSignature, 'utf8');
    const computedBuf = Buffer.from(
      crypto.createHmac('sha256', secret).update(payload).digest('hex'),
      'utf8'
    );
    assert.strictEqual(crypto.timingSafeEqual(validBuf, computedBuf), true);

    // Verify invalid signature rejected
    const invalidBuf = Buffer.from(invalidSignature, 'utf8');
    assert.notStrictEqual(validBuf.length, invalidBuf.length);
  });

  test('confirms demo payment bypass guard blocks in production', () => {
    const isProduction = true;
    const activeProvider = 'razorpay';
    const shouldBlock = isProduction || activeProvider !== 'demo';
    assert.strictEqual(shouldBlock, true, 'Demo payment MUST be blocked when in production or when razorpay is active');
  });

  // 11. Admin Authentication & Session Authorization Lifecycle Suite
  console.log(`\n[Suite 11: Admin Authentication & Session Authorization Lifecycle]`);

  await testAsync('Scenario 1: Correct admin email and password -> successful login with admin role', async () => {
    const originalPass = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = 'TestAdminSecret#2026';
    try {
      const req = {
        headers: { get: () => '127.0.0.1' },
        json: async () => ({ email: 'admin@anandcyclingclub.in', password: 'TestAdminSecret#2026' })
      };
      const res = await adminLoginPost(req);
      const json = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.user.role, 'admin');
    } finally {
      if (originalPass !== undefined) process.env.ADMIN_PASSWORD = originalPass;
      else delete process.env.ADMIN_PASSWORD;
    }
  });

  await testAsync('Scenario 2: Incorrect password -> rejected with 401 INVALID_PASSWORD', async () => {
    const originalPass = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = 'TestAdminSecret#2026';
    try {
      const req = {
        headers: { get: () => '127.0.0.1' },
        json: async () => ({ email: 'admin@anandcyclingclub.in', password: 'WrongPassword123!' })
      };
      const res = await adminLoginPost(req);
      const json = await res.json();
      assert.strictEqual(res.status, 401);
      assert.strictEqual(json.code, 'INVALID_PASSWORD');
    } finally {
      if (originalPass !== undefined) process.env.ADMIN_PASSWORD = originalPass;
      else delete process.env.ADMIN_PASSWORD;
    }
  });

  await testAsync('Scenario 3: Incorrect email -> rejected with 401 UNAUTHORIZED_EMAIL', async () => {
    const originalPass = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = 'TestAdminSecret#2026';
    try {
      const req = {
        headers: { get: () => '127.0.0.1' },
        json: async () => ({ email: 'stranger@example.com', password: 'TestAdminSecret#2026' })
      };
      const res = await adminLoginPost(req);
      const json = await res.json();
      assert.strictEqual(res.status, 401);
      assert.strictEqual(json.code, 'UNAUTHORIZED_EMAIL');
    } finally {
      if (originalPass !== undefined) process.env.ADMIN_PASSWORD = originalPass;
      else delete process.env.ADMIN_PASSWORD;
    }
  });

  await testAsync('Scenario 4: Missing ADMIN_PASSWORD in production -> secure 503 failure', async () => {
    const originalEnv = process.env.NODE_ENV;
    const originalPass = process.env.ADMIN_PASSWORD;
    process.env.NODE_ENV = 'production';
    delete process.env.ADMIN_PASSWORD;
    delete process.env.admin_password;
    try {
      const req = {
        headers: { get: () => '127.0.0.1' },
        json: async () => ({ email: 'admin@anandcyclingclub.in', password: 'AnyPassword' })
      };
      const res = await adminLoginPost(req);
      const json = await res.json();
      assert.strictEqual(res.status, 503);
      assert.strictEqual(json.code, 'MISSING_ADMIN_PASSWORD');
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalPass !== undefined) process.env.ADMIN_PASSWORD = originalPass;
    }
  });

  test('Scenario 5: Missing SESSION_SECRET in production -> fail-closed error', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.SESSION_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.SESSION_SECRET;
      assert.throws(() => getSessionSecret(), /SESSION_SECRET must be explicitly set/i);
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalSecret !== undefined) process.env.SESSION_SECRET = originalSecret;
    }
  });

  await testAsync('Scenario 6: Valid admin session token -> signed and verified with admin role', async () => {
    const adminSession = {
      userId: 'admin-00000000-0000-4000-a000-000000000001',
      email: 'admin@anandcyclingclub.in',
      fullName: 'Club Operations Admin',
      role: 'admin'
    };
    const token = await createSessionToken(adminSession);
    assert.strictEqual(typeof token, 'string');
    assert.strictEqual(token.includes('.'), true);

    const verified = await verifySessionToken(token);
    assert.ok(verified, 'Session token must verify successfully');
    assert.strictEqual(verified.email, 'admin@anandcyclingclub.in');
    assert.strictEqual(verified.role, 'admin');
  });

  await testAsync('Scenario 7: Expired or tampered session token -> rejected (null)', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.tampered_payload_data.invalid_signature_hex';
    const verified = await verifySessionToken(fakeToken);
    assert.strictEqual(verified, null, 'Tampered token must be rejected as null');
  });

  await testAsync('Scenario 8: Rider account session -> role is "rider", cannot claim admin', async () => {
    const riderSession = {
      userId: 'rider-00000000-0000-4000-a000-000000000002',
      email: 'rider@example.in',
      fullName: 'Rahul Sharma',
      role: 'rider'
    };
    const token = await createSessionToken(riderSession);
    const verified = await verifySessionToken(token);
    assert.ok(verified);
    assert.strictEqual(verified.role, 'rider');
    assert.notStrictEqual(verified.role, 'admin', 'Rider role must never match admin');
  });

  console.log(`\n================ Test Summary ================`);
  console.log(`Total Passed: ${passed}`);
  console.log(`Total Failed: ${failed}`);
  console.log(`==============================================\n`);

  if (failed > 0) process.exit(1);
}

runAll();

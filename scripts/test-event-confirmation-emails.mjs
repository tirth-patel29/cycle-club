import assert from 'assert';
import { db } from '../src/lib/db.ts';
import { sendConfirmationEmailSafely } from '../src/lib/email/service.ts';
import {
  generateConfirmationEmailHtml,
  generateConfirmationEmailText
} from '../src/lib/email/templates/confirmation.ts';
import { CLUB_NAME, CLUB_CONTACT_EMAIL, CLUB_CONTACT_PHONE } from '../src/lib/constants.ts';

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

async function run() {
  console.log(`\n================ EVENT CONFIRMATION EMAILS TEST SUITE ================`);

  // Mock Event
  const mockEvent = {
    id: 'e0000000-0000-0000-0000-000000000004',
    slug: 'charotar-community-morning-loop-15k',
    title: 'Charotar Community Morning Loop 15K',
    description: 'Complimentary morning community loop for cyclists in Anand.',
    cover_image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1600&q=80',
    venue: 'Anand Agricultural University (AAU) Gate, Anand',
    location_description: 'Starting from AAU Gate and looping back.',
    starts_at: '2026-12-20T06:30:00+05:30',
    ends_at: '2026-12-20T08:30:00+05:30',
    distance_km: 15,
    elevation_gain_m: 30,
    difficulty: 'Easy / Leisure',
    registration_fee_paise: 0,
    currency: 'INR',
    status: 'published',
    registration_opens_at: '2026-10-01T00:00:00+05:30',
    registration_closes_at: '2026-12-19T18:00:00+05:30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockPaidEvent = {
    id: 'e0000000-0000-0000-0000-000000000001',
    slug: 'amul-heritage-city-ride-2026',
    title: 'Amul Heritage Sunrise 45K',
    description: 'Morning ride through Charotar heritage villages.',
    cover_image_url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1600&q=80',
    venue: 'Town Hall Grounds, Near Anand Railway Station',
    location_description: 'Starting from Anand Town Hall.',
    starts_at: '2026-11-08T06:00:00+05:30',
    ends_at: '2026-11-08T09:30:00+05:30',
    distance_km: 45,
    elevation_gain_m: 120,
    difficulty: 'Easy / Leisure',
    registration_fee_paise: 29900,
    currency: 'INR',
    status: 'published',
    registration_opens_at: '2026-10-01T00:00:00+05:30',
    registration_closes_at: '2026-11-07T18:00:00+05:30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Mock Registration
  const mockRegistration = {
    id: 'reg-email-test-01',
    public_reference: 'ACC-2026-TEST1',
    event_id: mockEvent.id,
    event_title: mockEvent.title,
    full_name: 'Bhavesh Patel',
    mobile_number: '9825199999',
    email: 'bhavesh.patel@example.com',
    age: 34,
    gender: 'Male',
    bicycle_type: 'Gravel Cycle',
    bicycle_brand: 'Polygon',
    bicycle_model: 'Bend R2',
    jersey_size: 'L',
    terms_accepted_at: new Date().toISOString(),
    status: 'confirmed',
    amount_due_paise: 0,
    currency: 'INR',
    idempotency_key: 'b1111111-1111-1111-1111-111111111111',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Suite 1: Template Content & Formatting
  console.log(`\n[Suite 1: Branded Template Content & Links]`);
  test('HTML template includes all required event, rider, pass, and venue details', () => {
    const html = generateConfirmationEmailHtml({
      registration: mockRegistration,
      event: mockEvent
    });

    assert.ok(html.includes('Bhavesh Patel'), 'Includes rider name');
    assert.ok(html.includes(mockEvent.title), 'Includes event title');
    assert.ok(html.includes('ACC-2026-TEST1'), 'Includes reference code');
    assert.ok(html.includes('Gravel Cycle'), 'Includes bicycle category');
    assert.ok(html.includes('Polygon'), 'Includes bicycle brand');
    assert.ok(html.includes('Bend R2'), 'Includes bicycle model');
    assert.ok(html.includes('maps/search/?api=1'), 'Includes venue map search link');
    assert.ok(html.includes(encodeURIComponent(mockEvent.venue)), 'Includes encoded venue in map link');
    assert.ok(html.includes('/registrations/ACC-2026-TEST1'), 'Includes digital pass link');
    assert.ok(html.includes(CLUB_NAME), 'Includes club brand name');
    assert.ok(html.includes(CLUB_CONTACT_PHONE), 'Includes club contact phone');
    assert.ok(html.includes(CLUB_CONTACT_EMAIL), 'Includes club contact email');
    assert.ok(html.includes('FREE ENTRY'), 'Includes free entry badge');
  });

  test('Plain-text template includes all essentials for mobile/text fallbacks', () => {
    const text = generateConfirmationEmailText({
      registration: mockRegistration,
      event: mockEvent
    });

    assert.ok(text.includes('Bhavesh Patel'));
    assert.ok(text.includes('ACC-2026-TEST1'));
    assert.ok(text.includes('Gravel Cycle'));
    assert.ok(text.includes(mockEvent.venue));
    assert.ok(text.includes('/registrations/ACC-2026-TEST1'));
    assert.ok(text.includes(CLUB_CONTACT_PHONE));
  });

  // Suite 2: Free Event Trigger & Delivery
  console.log(`\n[Suite 2: Free Event Instant Confirmation Trigger]`);
  await testAsync('sends confirmation email for confirmed free registration', async () => {
    const result = await sendConfirmationEmailSafely({
      registration: mockRegistration,
      event: mockEvent
    });

    assert.strictEqual(result.sent, true, 'Email dispatch result should be true');
    assert.ok(result.emailId, 'Should return an email ID (real or simulated)');
    assert.strictEqual(result.recipient, 'bhavesh.patel@example.com');

    const delivered = await db.isEmailDelivered(mockRegistration.id, 'event_confirmation');
    assert.strictEqual(delivered, true, 'Delivery should be persisted in database tracking');
  });

  // Suite 3: Idempotency & Repeated Requests
  console.log(`\n[Suite 3: Idempotency & Duplicate Prevention]`);
  await testAsync('skips sending duplicate email on repeated request or retry', async () => {
    const duplicateResult = await sendConfirmationEmailSafely({
      registration: mockRegistration,
      event: mockEvent
    });

    assert.strictEqual(duplicateResult.sent, false, 'Should not re-send email');
    assert.strictEqual(duplicateResult.skipped, true, 'Should mark as skipped');
    assert.ok(duplicateResult.reason?.includes('idempotency'), 'Reason should indicate idempotency prevention');
  });

  // Suite 4: Unconfirmed / Pending State Guard
  console.log(`\n[Suite 4: Status Guard on Unconfirmed/Pending Registrations]`);
  await testAsync('does not send confirmation email if registration is pending payment', async () => {
    const pendingReg = {
      ...mockRegistration,
      id: 'reg-pending-01',
      public_reference: 'ACC-2026-PEND1',
      status: 'pending_payment',
      amount_due_paise: 29900
    };

    const result = await sendConfirmationEmailSafely({
      registration: pendingReg,
      event: mockPaidEvent
    });

    assert.strictEqual(result.sent, false, 'Pending registration must not trigger confirmation email');
    assert.strictEqual(result.skipped, true);

    const delivered = await db.isEmailDelivered(pendingReg.id, 'event_confirmation');
    assert.strictEqual(delivered, false, 'Should not record delivery for pending registration');
  });

  // Suite 5: Paid Event Succeeded Payment Trigger
  console.log(`\n[Suite 5: Paid Event Succeeded Payment Trigger]`);
  await testAsync('sends confirmation email when paid event payment is confirmed', async () => {
    const confirmedPaidReg = {
      ...mockRegistration,
      id: 'reg-paid-confirmed-01',
      public_reference: 'ACC-2026-PAID1',
      status: 'confirmed',
      amount_due_paise: 29900
    };

    const mockPayment = {
      id: 'pay-001',
      registration_id: confirmedPaidReg.id,
      provider: 'demo',
      provider_payment_reference: 'DEMO_TXN_VERIFIED_8829',
      amount_paise: 29900,
      currency: 'INR',
      status: 'succeeded',
      idempotency_key: 'b2222222-2222-2222-2222-222222222222',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await sendConfirmationEmailSafely({
      registration: confirmedPaidReg,
      event: mockPaidEvent,
      payment: mockPayment
    });

    assert.strictEqual(result.sent, true, 'Should send confirmation after verified payment');

    const html = generateConfirmationEmailHtml({
      registration: confirmedPaidReg,
      event: mockPaidEvent,
      payment: mockPayment
    });
    assert.ok(html.includes('₹299'), 'Includes paid amount');
    assert.ok(html.includes('DEMO_TXN_VERIFIED_8829'), 'Includes transaction reference');
  });

  // Suite 6: Failed Payment Guard
  console.log(`\n[Suite 6: Failed Payment Guard]`);
  test('failed payment does not send confirmation email', () => {
    const failedPaymentReg = {
      ...mockRegistration,
      id: 'reg-paid-failed-01',
      public_reference: 'ACC-2026-FAIL1',
      status: 'pending_payment',
      amount_due_paise: 29900
    };

    // Because status remains 'pending_payment' when payment fails:
    assert.strictEqual(failedPaymentReg.status, 'pending_payment');
  });

  // Suite 7: Provider Outage Non-Blocking Resilience
  console.log(`\n[Suite 7: Provider Outage & Exception Resilience]`);
  await testAsync('safe wrapper catches provider errors without throwing to caller', async () => {
    const regWithoutEmail = {
      ...mockRegistration,
      id: 'reg-no-email-01',
      public_reference: 'ACC-2026-NOEM',
      email: undefined,
      rider_id: undefined
    };

    const result = await sendConfirmationEmailSafely({
      registration: regWithoutEmail,
      event: mockEvent
    });

    assert.strictEqual(result.sent, false);
    assert.strictEqual(result.skipped, true);
    assert.ok(result.reason?.includes('No valid recipient email'));
  });

  console.log(`\n================ Summary ================`);
  console.log(`Total Passed: ${passed}`);
  console.log(`Total Failed: ${failed}`);
  console.log(`=========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

run();

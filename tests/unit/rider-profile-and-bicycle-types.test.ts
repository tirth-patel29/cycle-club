import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import {
  BICYCLE_TYPES,
  bicycleTypeSchema,
  riderProfileSchema,
  registrationSchema
} from '@/lib/validations/registration';

describe('Bicycle Type Schema Enforcement', () => {
  it('strictly validates all five canonical bicycle types', () => {
    const canonicalTypes = ['Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle'];
    expect(BICYCLE_TYPES).toEqual(canonicalTypes);

    for (const type of canonicalTypes) {
      const res = bicycleTypeSchema.safeParse(type);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data).toBe(type);
      }
    }
  });

  it('rejects unapproved or legacy bicycle types', () => {
    const invalidTypes = [
      'Road Bike',
      'Single Speed',
      'Fixie',
      'Electric Scooter',
      'Cruiser',
      'BMX',
      '',
      null,
      undefined
    ];

    for (const invalid of invalidTypes) {
      const res = bicycleTypeSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    }
  });
});

describe('Rider Profile Lifecycle & Event Registration Prefill', () => {
  const testUserId = 'test-rider-uuid-1234';

  beforeEach(async () => {
    // Reset/seed rider profile
    await db.upsertRiderProfile(testUserId, {
      full_name: 'Aarav Patel',
      mobile_number: '9825011223',
      bicycle_type: 'Road',
      bicycle_brand: 'Trek',
      bicycle_model: 'Domane AL 2',
      age: 28,
      gender: 'Male',
      tshirt_size: 'L'
    });
  });

  it('creates and retrieves rider profile with canonical bicycle type', async () => {
    const profile = await db.getRiderProfile(testUserId);
    expect(profile).toBeDefined();
    expect(profile?.full_name).toBe('Aarav Patel');
    expect(profile?.bicycle_type).toBe('Road');
    expect(profile?.bicycle_brand).toBe('Trek');
  });

  it('updates rider profile without affecting past registrations', async () => {
    // 1. Create registration with initial Road bike
    const reg1 = await db.createRegistration({
      event_id: 'evt-001',
      event_title: 'Amul Heritage Sunrise 45K',
      rider_id: testUserId,
      full_name: 'Aarav Patel',
      mobile_number: '9825011223',
      age: 28,
      gender: 'Male',
      bicycle_type: 'Road',
      bicycle_brand: 'Trek',
      bicycle_model: 'Domane AL 2',
      jersey_size: 'L',
      terms_accepted_at: new Date().toISOString(),
      status: 'pending_payment',
      amount_due_paise: 29900,
      currency: 'INR',
      idempotency_key: 'idemp-profile-test-1'
    });

    expect(reg1.bicycle_type).toBe('Road');

    // 2. Rider updates their profile to Gravel Cycle
    await db.upsertRiderProfile(testUserId, {
      bicycle_type: 'Gravel Cycle',
      bicycle_brand: 'Cannondale',
      bicycle_model: 'Topstone 3'
    });

    const updatedProfile = await db.getRiderProfile(testUserId);
    expect(updatedProfile?.bicycle_type).toBe('Gravel Cycle');

    // 3. Historical registration snapshot must NOT be modified
    const fetchedReg1 = await db.getRegistrationByReference(reg1.public_reference);
    expect(fetchedReg1?.bicycle_type).toBe('Road');
    expect(fetchedReg1?.bicycle_brand).toBe('Trek');
  });

  it('allows event-specific bicycle choice without overwriting permanent profile', async () => {
    const profile = await db.getRiderProfile(testUserId);
    expect(profile?.bicycle_type).toBe('Road');

    // Rider enters event with MTB for that particular dirt ride
    const reg2 = await db.createRegistration({
      event_id: 'evt-002',
      event_title: 'Mahi River Canal Century 100K',
      rider_id: testUserId,
      full_name: 'Aarav Patel',
      mobile_number: '9825011223',
      age: 28,
      gender: 'Male',
      bicycle_type: 'MTB', // event-specific change
      bicycle_brand: 'Scott',
      bicycle_model: 'Aspect 950',
      jersey_size: 'L',
      terms_accepted_at: new Date().toISOString(),
      status: 'pending_payment',
      amount_due_paise: 49900,
      currency: 'INR',
      idempotency_key: 'idemp-profile-test-2'
    });

    expect(reg2.bicycle_type).toBe('MTB');

    // Permanent profile remains untouched
    const currentProfile = await db.getRiderProfile(testUserId);
    expect(currentProfile?.bicycle_type).toBe('Road');
  });
});

describe('Free Event Registration Flow', () => {
  it('instantly confirms ₹0 free events without creating fake payment transactions', async () => {
    const idempotencyKey = 'free-event-idemp-uuid-001';

    const freeReg = await db.createRegistration({
      event_id: 'evt-004',
      event_title: 'Charotar Community Morning Loop 15K',
      rider_id: 'test-rider-free-1',
      full_name: 'Pooja Bhatt',
      mobile_number: '9824099887',
      age: 24,
      gender: 'Female',
      bicycle_type: 'City Bike',
      jersey_size: 'M',
      terms_accepted_at: new Date().toISOString(),
      status: 'pending_payment',
      amount_due_paise: 0, // Free event
      currency: 'INR',
      idempotency_key: idempotencyKey
    });

    expect(freeReg.amount_due_paise).toBe(0);
    expect(freeReg.status).toBe('confirmed');
    expect(freeReg.public_reference).toMatch(/^ACC-\d{4}-[A-Z0-9]+$/);

    const payment = await db.getPaymentByRegistrationId(freeReg.id);
    expect(payment).toBeNull();
  });
});

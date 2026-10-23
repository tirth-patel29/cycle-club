import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db';

describe('Database and Idempotency Lifecycle', () => {
  it('creates a registration and generates an unguessable public reference', async () => {
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

    expect(reg.public_reference).toMatch(/^ACC-\d{4}-[A-Z0-9]+$/);
    expect(reg.status).toBe('pending_payment');
    expect(reg.amount_due_paise).toBe(29900);

    // Repeated submission with SAME idempotency key must return the SAME registration
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

    expect(retry.id).toBe(reg.id);
    expect(retry.public_reference).toBe(reg.public_reference);
  });

  it('atomically transitions pending registration to confirmed upon successful demo payment', async () => {
    const idempotencyKey = 'f1e2d3c4-b5a6-7890-1234-abcdef123456';
    const reg = await db.createRegistration({
      event_id: 'evt-001',
      event_title: 'Amul Heritage Sunrise 45K',
      full_name: 'Kiritbhai Shah',
      mobile_number: '9824054321',
      age: 55,
      gender: 'Male',
      terms_accepted_at: new Date().toISOString(),
      status: 'pending_payment',
      amount_due_paise: 29900,
      currency: 'INR',
      idempotency_key: idempotencyKey
    });

    const { registration: updatedReg, payment } = await db.processDemoPayment(
      reg.public_reference,
      'success'
    );

    expect(updatedReg.status).toBe('confirmed');
    expect(payment.status).toBe('succeeded');
    expect(payment.provider_payment_reference).toContain('DEMO_TXN_');
  });

  it('preserves registration as pending when demo payment is simulated as declined', async () => {
    const idempotencyKey = '99e8d7c6-b5a4-3210-9876-abcdef654321';
    const reg = await db.createRegistration({
      event_id: 'evt-001',
      event_title: 'Amul Heritage Sunrise 45K',
      full_name: 'Jignesh Mewani',
      mobile_number: '9824011111',
      age: 40,
      gender: 'Male',
      terms_accepted_at: new Date().toISOString(),
      status: 'pending_payment',
      amount_due_paise: 29900,
      currency: 'INR',
      idempotency_key: idempotencyKey
    });

    const { registration: failedReg, payment } = await db.processDemoPayment(
      reg.public_reference,
      'failure'
    );

    expect(failedReg.status).toBe('pending_payment');
    expect(payment.status).toBe('failed');
  });
});

import { describe, it, expect } from 'vitest';
import { normalizeIndianMobile, INDIAN_MOBILE_REGEX, registrationSchema } from '@/lib/validations/registration';
import { sanitizeCsvCell } from '@/lib/db';

describe('Indian Mobile Number Normalization & Validation', () => {
  it('normalizes mobile numbers with spaces, +91, and leading zeroes', () => {
    expect(normalizeIndianMobile('+91 98250 12345')).toBe('9825012345');
    expect(normalizeIndianMobile('09825012345')).toBe('9825012345');
    expect(normalizeIndianMobile('919825012345')).toBe('9825012345');
    expect(normalizeIndianMobile('98250-12345')).toBe('9825012345');
  });

  it('validates 10-digit Indian numbers starting with 6, 7, 8, or 9', () => {
    expect(INDIAN_MOBILE_REGEX.test('9825012345')).toBe(true);
    expect(INDIAN_MOBILE_REGEX.test('8825012345')).toBe(true);
    expect(INDIAN_MOBILE_REGEX.test('7825012345')).toBe(true);
    expect(INDIAN_MOBILE_REGEX.test('6825012345')).toBe(true);
    // Invalid starters
    expect(INDIAN_MOBILE_REGEX.test('5825012345')).toBe(false);
    expect(INDIAN_MOBILE_REGEX.test('1234567890')).toBe(false);
    // Invalid length
    expect(INDIAN_MOBILE_REGEX.test('98250')).toBe(false);
    expect(INDIAN_MOBILE_REGEX.test('98250123456')).toBe(false);
  });
});

describe('Registration Form Zod Schema Validation', () => {
  const validData = {
    event_id: 'evt-001',
    full_name: 'Dineshbhai Patel',
    mobile_number: '+91 98250 54321',
    email: 'dinesh@example.com',
    age: 48,
    gender: 'Male',
    bicycle_type: 'Hybrid',
    jersey_size: 'L',
    terms_accepted: true,
    idempotency_key: '550e8400-e29b-41d4-a716-446655440000'
  };

  it('accepts valid registration data', () => {
    const result = registrationSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mobile_number).toBe('9825054321');
    }
  });

  it('rejects participants below age 12', () => {
    const result = registrationSchema.safeParse({ ...validData, age: 10 });
    expect(result.success).toBe(false);
  });

  it('rejects submissions if terms are not accepted', () => {
    const result = registrationSchema.safeParse({ ...validData, terms_accepted: false });
    expect(result.success).toBe(false);
  });

  it('rejects malformed idempotency keys', () => {
    const result = registrationSchema.safeParse({ ...validData, idempotency_key: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});

describe('CSV Formula Injection Prevention', () => {
  it('escapes cells starting with formula triggers (=, +, -, @, tab)', () => {
    expect(sanitizeCsvCell('=SUM(A1:A10)')).toBe('"\'=SUM(A1:A10)""');
    expect(sanitizeCsvCell('+cmd|/c calc')).toBe('"\'+cmd|/c calc"');
    expect(sanitizeCsvCell('-50')).toBe('"\'-50"');
    expect(sanitizeCsvCell('@test')).toBe('"\'@test"');
  });

  it('preserves ordinary safe values correctly quoted', () => {
    expect(sanitizeCsvCell('Rajesh Patel')).toBe('"Rajesh Patel"');
    expect(sanitizeCsvCell('9825012345')).toBe('"9825012345"');
  });
});

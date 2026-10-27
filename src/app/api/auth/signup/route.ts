import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { setSessionCookie, ensureUuid } from '@/lib/auth';
import { normalizeIndianMobile, INDIAN_MOBILE_REGEX, BICYCLE_TYPES } from '@/lib/validations/registration';
import { BicycleType } from '@/types';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  full_name: z.string().trim().min(2, 'Please enter your full name'),
  mobile_number: z.string().trim().transform(normalizeIndianMobile).refine((val) => INDIAN_MOBILE_REGEX.test(val), {
    message: 'Please enter a valid 10-digit Indian mobile number'
  }),
  bicycle_type: z.enum(BICYCLE_TYPES, {
    message: 'Please select an approved bicycle type'
  }),
  bicycle_brand: z.string().trim().optional(),
  bicycle_model: z.string().trim().optional(),
  age: z.coerce.number().min(12).max(100).optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  tshirt_size: z.enum(['S', 'M', 'L', 'XL', '2XL', 'None']).optional().default('None')
});

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const errorDetails = parsed.error.flatten().fieldErrors;
    const firstErrorMessage = Object.values(errorDetails).flat()[0] || 'Validation failed';
    return NextResponse.json({ error: firstErrorMessage, details: errorDetails }, { status: 422 });
  }

  const {
    email,
    password,
    full_name,
    mobile_number,
    bicycle_type,
    bicycle_brand,
    bicycle_model,
    age,
    gender,
    tshirt_size
  } = parsed.data;

  // Generate a stable UUID for the rider
  const userId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : ensureUuid(email);

  try {
    // 1. Persist rider profile in database (Neon PostgreSQL or local store)
    const savedProfile = await db.upsertRiderProfile(userId, {
      full_name,
      email,
      mobile_number,
      bicycle_type: bicycle_type as BicycleType,
      bicycle_brand: bicycle_brand || undefined,
      bicycle_model: bicycle_model || undefined,
      age,
      gender,
      tshirt_size
    });

    // 2. Set authoritative secure session cookie
    await setSessionCookie({
      userId,
      email,
      fullName: full_name,
      role: 'rider'
    });

    return NextResponse.json({
      success: true,
      message: `Account created successfully! Welcome to THE ANAND CYCLING CLUB, ${full_name}.`,
      user: {
        id: userId,
        email,
        full_name,
        bicycle_type
      },
      profile: savedProfile
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create rider account. Please try again.' },
      { status: 500 }
    );
  }
}

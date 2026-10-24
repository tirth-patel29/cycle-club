import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrationSchema } from '@/lib/validations/registration';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate payload with Zod
    const parseResult = registrationSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Validation error';
      return NextResponse.json({ error: firstError, details: parseResult.error.format() }, { status: 400 });
    }

    const {
      event_id,
      rider_id,
      full_name,
      mobile_number,
      email,
      age,
      gender,
      bicycle_type,
      bicycle_brand,
      bicycle_model,
      jersey_size,
      emergency_contact_name,
      emergency_contact_phone,
      idempotency_key
    } = parseResult.data;

    // 2. Check for existing registration with the same idempotency key
    const existing = await db.getRegistrationByIdempotencyKey(idempotency_key);
    if (existing) {
      return NextResponse.json({
        success: true,
        is_retry: true,
        is_free: existing.amount_due_paise === 0,
        public_reference: existing.public_reference,
        status: existing.status,
        amount_due_paise: existing.amount_due_paise
      });
    }

    // 3. Load authoritative event from DB
    const event = await db.getEventById(event_id);
    if (!event) {
      return NextResponse.json({ error: 'Selected event not found' }, { status: 404 });
    }

    if (event.status !== 'published') {
      return NextResponse.json({ error: 'This event is not currently accepting registrations' }, { status: 400 });
    }

    if (new Date() > new Date(event.registration_closes_at)) {
      return NextResponse.json({ error: 'Registration deadline has passed for this ride' }, { status: 400 });
    }

    // 4. Calculate authoritative price from database (Never trust client price!)
    const amountDuePaise = event.registration_fee_paise;
    const currency = event.currency || 'INR';
    const isFree = amountDuePaise === 0;

    // 5. Persist registration safely
    const newReg = await db.createRegistration({
      event_id: event.id,
      rider_id: rider_id || undefined,
      event_title: event.title,
      full_name,
      mobile_number,
      email: email || undefined,
      age,
      gender,
      bicycle_type,
      bicycle_brand: bicycle_brand || undefined,
      bicycle_model: bicycle_model || undefined,
      jersey_size,
      emergency_contact_name,
      emergency_contact_phone,
      terms_accepted_at: new Date().toISOString(),
      status: isFree ? 'confirmed' : 'pending_payment',
      amount_due_paise: amountDuePaise,
      currency,
      idempotency_key
    });

    return NextResponse.json({
      success: true,
      is_free: isFree,
      public_reference: newReg.public_reference,
      status: newReg.status,
      amount_due_paise: newReg.amount_due_paise,
      currency: newReg.currency
    });
  } catch (err: unknown) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

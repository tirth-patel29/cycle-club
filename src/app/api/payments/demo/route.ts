import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const demoPaymentSchema = z.object({
  registration_reference: z.string().min(1, 'Registration reference is required'),
  outcome: z.enum(['success', 'failure']),
  payment_method: z.enum(['upi_qr', 'card', 'netbanking']).default('upi_qr')
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = demoPaymentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid demo payment parameters' }, { status: 400 });
    }

    const { registration_reference, outcome } = parseResult.data;

    // Load registration
    const reg = await db.getRegistrationByReference(registration_reference);
    if (!reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // If already confirmed, return idempotently
    if (reg.status === 'confirmed' && outcome === 'success') {
      const existingPayment = await db.getPaymentByRegistrationId(reg.id);
      return NextResponse.json({
        success: true,
        already_confirmed: true,
        public_reference: reg.public_reference,
        status: reg.status,
        payment_reference: existingPayment?.provider_payment_reference
      });
    }

    // Process transition in DB
    const { registration: updatedReg, payment: updatedPayment } = await db.processDemoPayment(
      registration_reference,
      outcome
    );

    if (outcome === 'success') {
      return NextResponse.json({
        success: true,
        public_reference: updatedReg.public_reference,
        status: updatedReg.status,
        payment_reference: updatedPayment.provider_payment_reference,
        amount_paid_paise: updatedPayment.amount_paise,
        currency: updatedPayment.currency
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Simulated payment was declined or failed in demo mode.',
        can_retry: true,
        public_reference: reg.public_reference,
        status: reg.status
      });
    }
  } catch (err: unknown) {
    console.error('Demo payment error:', err);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred during payment processing.' },
      { status: 500 }
    );
  }
}

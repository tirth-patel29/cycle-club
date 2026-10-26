import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getRazorpayConfig, getPaymentProviderName } from '@/lib/payments/config';
import { RazorpayPaymentProvider } from '@/lib/payments/boundary';

const createOrderSchema = z.object({
  registration_reference: z.string().min(1, 'Registration reference is required')
});

export async function POST(req: NextRequest) {
  try {
    const providerName = getPaymentProviderName();
    if (providerName !== 'razorpay') {
      return NextResponse.json(
        { error: 'Razorpay is not the active payment provider in current configuration.' },
        { status: 400 }
      );
    }

    const config = getRazorpayConfig();
    const body = await req.json();
    const parseResult = createOrderSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid order parameters' }, { status: 400 });
    }

    const { registration_reference } = parseResult.data;

    // 1. Authoritative lookup of registration
    const reg = await db.getRegistrationByReference(registration_reference);
    if (!reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // 2. Guard: if already confirmed, do not create another order
    if (reg.status === 'confirmed') {
      const existingPayment = await db.getPaymentByRegistrationId(reg.id);
      return NextResponse.json({
        success: true,
        already_confirmed: true,
        public_reference: reg.public_reference,
        status: reg.status,
        payment_reference: existingPayment?.provider_payment_reference
      });
    }

    // 3. Authoritative event lookup & price calculation (Never trust client prices!)
    const event = await db.getEventById(reg.event_id);
    if (!event) {
      return NextResponse.json({ error: 'Associated event not found' }, { status: 404 });
    }

    if (event.status !== 'published') {
      return NextResponse.json({ error: 'Event is not currently published' }, { status: 400 });
    }

    if (new Date() > new Date(event.registration_closes_at)) {
      return NextResponse.json({ error: 'Registration has closed for this event' }, { status: 400 });
    }

    const amountDuePaise = event.registration_fee_paise;
    if (amountDuePaise <= 0) {
      return NextResponse.json(
        { error: 'Free events do not require payment processing.' },
        { status: 400 }
      );
    }

    // 4. Check for existing active initiated payment order to prevent duplicates
    const existingPayment = await db.getPaymentByRegistrationId(reg.id);
    if (
      existingPayment &&
      existingPayment.provider === 'razorpay' &&
      existingPayment.status === 'initiated' &&
      existingPayment.razorpay_order_id &&
      existingPayment.amount_paise === amountDuePaise
    ) {
      return NextResponse.json({
        success: true,
        order_id: existingPayment.razorpay_order_id,
        amount_paise: existingPayment.amount_paise,
        currency: existingPayment.currency,
        key_id: config.keyId,
        public_reference: reg.public_reference,
        event_title: event.title,
        rider_name: reg.full_name,
        rider_email: reg.email || '',
        rider_phone: reg.mobile_number
      });
    }

    // 5. Create official Razorpay Order via SDK
    const provider = new RazorpayPaymentProvider();
    const orderResult = await provider.createOrder({
      registrationId: reg.id,
      amountPaise: amountDuePaise,
      currency: event.currency || 'INR',
      receiptReference: reg.public_reference
    });

    // 6. Record order transactionally in database
    await db.recordRazorpayOrder({
      registrationId: reg.id,
      orderId: orderResult.orderId,
      amountPaise: orderResult.amountPaise,
      currency: orderResult.currency
    });

    // 7. Return public parameters for Razorpay Checkout
    return NextResponse.json({
      success: true,
      order_id: orderResult.orderId,
      amount_paise: orderResult.amountPaise,
      currency: orderResult.currency,
      key_id: config.keyId,
      public_reference: reg.public_reference,
      event_title: event.title,
      rider_name: reg.full_name,
      rider_email: reg.email || '',
      rider_phone: reg.mobile_number
    });
  } catch (err: unknown) {
    console.error('Razorpay order creation error:', err);
    const message = err instanceof Error ? err.message : 'Failed to create payment order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

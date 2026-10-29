import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { getRazorpayConfig, getPaymentProviderName } from '@/lib/payments/config';
import { RazorpayPaymentProvider } from '@/lib/payments/boundary';
import { sendConfirmationEmailSafely } from '@/lib/email/service';

const verifyPaymentSchema = z.object({
  registration_reference: z.string().min(1, 'Registration reference is required'),
  razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay signature is required')
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
    const parseResult = verifyPaymentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid verification parameters' }, { status: 400 });
    }

    const {
      registration_reference,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = parseResult.data;

    // 1. Authenticate signature cryptographically using constant-time HMAC-SHA256
    const provider = new RazorpayPaymentProvider();
    const sigVerification = await provider.verifyPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!sigVerification.success) {
      console.warn(
        `[Security] Invalid signature verification attempt for registration "${registration_reference}" and order "${razorpay_order_id}"`
      );
      return NextResponse.json(
        { error: 'Invalid payment signature. Payment cannot be verified.' },
        { status: 400 }
      );
    }

    // 2. Authoritative lookup of registration
    const reg = await db.getRegistrationByReference(registration_reference);
    if (!reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // 3. Ensure this order belongs to this registration
    const orderPayment = await db.getPaymentByRazorpayOrderId(razorpay_order_id);
    if (orderPayment && orderPayment.registration_id !== reg.id) {
      console.error(
        `[Security] Order ID ${razorpay_order_id} registration mismatch: DB registration ${orderPayment.registration_id} vs passed registration ${reg.id}`
      );
      return NextResponse.json(
        { error: 'Payment does not match the specified registration record.' },
        { status: 400 }
      );
    }

    // 4. Idempotency Guard: if already confirmed, return success without re-processing
    if (reg.status === 'confirmed') {
      const existingPayment = await db.getPaymentByRegistrationId(reg.id);
      return NextResponse.json({
        success: true,
        already_confirmed: true,
        public_reference: reg.public_reference,
        status: reg.status,
        payment_reference: existingPayment?.provider_payment_reference || razorpay_payment_id
      });
    }

    // 5. Query Razorpay API to verify actual captured payment status, amount, and currency
    const client = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret
    });

    try {
      const paymentDetails = await client.payments.fetch(razorpay_payment_id);

      if (paymentDetails.order_id !== razorpay_order_id) {
        return NextResponse.json(
          { error: 'Payment order ID does not match the verified order.' },
          { status: 400 }
        );
      }

      // Razorpay returns amount in paise as a number or string — normalise both sides
      const paidPaise = Math.round(Number(paymentDetails.amount));
      const duePaise = Math.round(Number(reg.amount_due_paise));
      if (paidPaise !== duePaise) {
        console.error(
          `[Security] Amount mismatch: expected ${duePaise} paise, Razorpay reports ${paidPaise} paise for payment ${razorpay_payment_id}.`
        );
        return NextResponse.json(
          { error: 'Paid amount does not match authoritative registration fee.' },
          { status: 400 }
        );
      }

      if (paymentDetails.currency !== (reg.currency || 'INR')) {
        return NextResponse.json(
          { error: 'Payment currency mismatch.' },
          { status: 400 }
        );
      }

      const validStatuses = ['captured', 'authorized'];
      if (!validStatuses.includes(paymentDetails.status)) {
        return NextResponse.json(
          { error: `Payment is not in a completed status (current status: ${paymentDetails.status}).` },
          { status: 400 }
        );
      }
    } catch (fetchErr) {
      // Razorpay secondary validation unavailable — rely on HMAC signature alone (already verified above)
      console.warn('[Razorpay Verify] Secondary payment fetch failed — trusting HMAC signature:', fetchErr);
    }

    // 6. Transactionally confirm registration & payment in database
    const { registration: updatedReg, payment: updatedPayment, alreadyConfirmed } =
      await db.confirmRazorpayPayment({
        registrationReference: reg.public_reference,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature
      });

    // 7. Dispatch confirmation email (non-blocking, only for newly confirmed passes)
    if (!alreadyConfirmed && updatedReg.status === 'confirmed') {
      try {
        const event = await db.getEventById(updatedReg.event_id);
        if (event) {
          await sendConfirmationEmailSafely({
            registration: updatedReg,
            event,
            payment: updatedPayment
          });
        }
      } catch (emailErr) {
        console.error('Non-blocking confirmation email dispatch error (Razorpay paid event):', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      public_reference: updatedReg.public_reference,
      status: updatedReg.status,
      payment_reference: updatedPayment.provider_payment_reference,
      amount_paid_paise: updatedPayment.amount_paise,
      currency: updatedPayment.currency
    });
  } catch (err: unknown) {
    console.error('Razorpay payment verification error:', err);
    const message = err instanceof Error ? err.message : 'Failed to verify payment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

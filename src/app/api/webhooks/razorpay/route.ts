import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getRazorpayConfig } from '@/lib/payments/config';
import { sendConfirmationEmailSafely } from '@/lib/email/service';

export async function POST(req: NextRequest) {
  try {
    // 1. Read raw body as string (CRITICAL: Do NOT parse and re-serialize before signature check)
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      console.warn('[Razorpay Webhook] Missing x-razorpay-signature header');
      return NextResponse.json({ error: 'Missing webhook signature header' }, { status: 400 });
    }

    // 2. Validate webhook signature using configured webhook secret
    let webhookSecret = '';
    try {
      const config = getRazorpayConfig();
      webhookSecret = config.webhookSecret || '';
    } catch {
      // Configuration missing
    }

    if (!webhookSecret) {
      console.warn(
        '[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not configured on server. Rejecting webhook.'
      );
      return NextResponse.json(
        { error: 'Webhook secret is not configured on server' },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      console.warn('[Razorpay Webhook] Invalid webhook signature detected');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    // 3. Parse validated JSON payload
    const eventPayload = JSON.parse(rawBody);
    const eventType = eventPayload.event;
    const eventId = eventPayload.id;

    console.log(`[Razorpay Webhook] Processing event "${eventType}" (Event ID: ${eventId})`);

    // 4. Process event types
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = eventPayload.payload?.payment?.entity;
      const orderEntity = eventPayload.payload?.order?.entity;

      const orderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id || (orderId ? `pay_${orderId}` : '');
      const notes = paymentEntity?.notes || orderEntity?.notes || {};
      const regReference = notes.registration_reference || notes.receipt_reference;

      // Find registration by reference or by order ID in database
      let registration = null;
      if (regReference) {
        registration = await db.getRegistrationByReference(regReference);
      }

      if (!registration && orderId) {
        const pay = await db.getPaymentByRazorpayOrderId(orderId);
        if (pay) {
          registration = await db.getRegistrationById(pay.registration_id);
        }
      }

      if (!registration) {
        console.warn(`[Razorpay Webhook] No matching registration found for order "${orderId}"`);
        return NextResponse.json({ received: true, note: 'No matching registration' }, { status: 200 });
      }

      // Idempotency: if already confirmed, do nothing
      if (registration.status === 'confirmed') {
        return NextResponse.json({ received: true, already_confirmed: true }, { status: 200 });
      }

      // Confirm payment & registration
      const { registration: updatedReg, payment: updatedPayment, alreadyConfirmed } =
        await db.confirmRazorpayPayment({
          registrationReference: registration.public_reference,
          orderId: orderId || '',
          paymentId: paymentId || '',
          signature: signature
        });

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
          console.error('[Razorpay Webhook] Confirmation email dispatch error:', emailErr);
        }
      }

      return NextResponse.json({ received: true, status: 'confirmed' }, { status: 200 });
    }

    if (eventType === 'payment.failed') {
      const paymentEntity = eventPayload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const errorDescription = paymentEntity?.error_description || 'Payment failed';

      if (orderId) {
        // Record failure without downgrading if already succeeded
        await db.recordRazorpayFailure({
          orderId,
          paymentId,
          reason: errorDescription
        });
      }

      return NextResponse.json({ received: true, status: 'failed_recorded' }, { status: 200 });
    }

    // Default: acknowledge other non-critical events
    return NextResponse.json({ received: true, ignored: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('[Razorpay Webhook Error]:', err);
    return NextResponse.json({ error: 'Internal webhook handler error' }, { status: 500 });
  }
}

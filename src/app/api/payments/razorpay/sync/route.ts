import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RazorpayPaymentProvider } from '@/lib/payments/boundary';
import { sendConfirmationEmailSafely } from '@/lib/email/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reference = body.registration_reference;

    if (!reference) {
      return NextResponse.json({ error: 'registration_reference is required' }, { status: 400 });
    }

    const reg = await db.getRegistrationByReference(reference);
    if (!reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (reg.status === 'confirmed') {
      return NextResponse.json({
        success: true,
        status: 'confirmed',
        already_confirmed: true,
        registration_reference: reg.public_reference
      });
    }

    // Find the latest payment record for this registration
    const payment = await db.getPaymentByRegistrationId(reg.id);
    const orderId = payment?.razorpay_order_id || payment?.provider_payment_reference;

    if (!orderId) {
      return NextResponse.json({
        success: true,
        status: 'pending',
        note: 'No payment order found yet'
      });
    }

    // Query Razorpay API directly to check if the order has any captured payments
    let paymentsCount = 0;
    let rzpErrorMsg: string | null = null;
    try {
      const provider = new RazorpayPaymentProvider();
      const payments = await provider.fetchOrderPayments(orderId);
      paymentsCount = Array.isArray(payments) ? payments.length : 0;

      const successfulPayment = Array.isArray(payments)
        ? payments.find((p: any) => p.status === 'captured' || p.status === 'authorized')
        : null;

      if (successfulPayment) {
        const { registration: updatedReg, payment: updatedPayment, alreadyConfirmed } =
          await db.confirmRazorpayPayment({
            registrationReference: reg.public_reference,
            orderId: orderId,
            paymentId: successfulPayment.id,
            signature: undefined
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
            console.error('[Razorpay Sync] Confirmation email dispatch error:', emailErr);
          }
        }

        return NextResponse.json({
          success: true,
          status: 'confirmed',
          payment_id: successfulPayment.id,
          registration_reference: reg.public_reference
        });
      }
    } catch (rzpErr: unknown) {
      rzpErrorMsg = rzpErr instanceof Error ? rzpErr.message : String(rzpErr);
      console.warn('[Razorpay Sync API] Could not fetch payments from Razorpay:', rzpErr);
    }

    return NextResponse.json({
      success: true,
      status: 'pending',
      order_id: orderId,
      debug: { payments_count: paymentsCount, error: rzpErrorMsg }
    });
  } catch (err: unknown) {
    console.error('[Razorpay Sync Error]:', err);
    return NextResponse.json({ error: 'Internal sync error' }, { status: 500 });
  }
}

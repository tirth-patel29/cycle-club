import crypto from 'crypto';
import Razorpay from 'razorpay';
import { getPaymentProviderName, getRazorpayConfig } from './config';

/**
 * Payment Provider Abstraction Layer
 *
 * Supports both Demo Simulated and Razorpay Payment Gateways.
 * Provider is selected via PAYMENT_PROVIDER environment variable.
 */

export interface CreateOrderParams {
  registrationId: string;
  amountPaise: number;
  currency: string;
  receiptReference: string;
}

export interface PaymentOrderResult {
  provider: 'demo' | 'razorpay';
  orderId: string;
  amountPaise: number;
  currency: string;
  isDemo: boolean;
}

export interface VerifyPaymentPayload {
  orderId: string;
  paymentId: string;
  signature?: string;
}

export interface PaymentProvider {
  name: 'demo' | 'razorpay';
  createOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  verifyPayment(payload: VerifyPaymentPayload): Promise<{ success: boolean; error?: string }>;
}

export class DemoPaymentProvider implements PaymentProvider {
  name = 'demo' as const;

  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    return {
      provider: 'demo',
      orderId: `order_demo_${Date.now()}`,
      amountPaise: params.amountPaise,
      currency: params.currency,
      isDemo: true
    };
  }

  async verifyPayment(payload: VerifyPaymentPayload): Promise<{ success: boolean; error?: string }> {
    if (!payload.orderId || !payload.paymentId) {
      return { success: false, error: 'Missing demo order or payment reference' };
    }
    return { success: true };
  }
}

export class RazorpayPaymentProvider implements PaymentProvider {
  name = 'razorpay' as const;

  private getClient(): { client: Razorpay; keyId: string; keySecret: string; isTestMode: boolean } {
    const config = getRazorpayConfig();
    const client = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret
    });
    return { client, keyId: config.keyId, keySecret: config.keySecret, isTestMode: config.isTestMode };
  }

  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    const { client, isTestMode } = this.getClient();

    const order = await client.orders.create({
      amount: params.amountPaise,
      currency: params.currency || 'INR',
      receipt: params.receiptReference.slice(0, 40),
      notes: {
        registration_id: params.registrationId,
        receipt_reference: params.receiptReference
      }
    });

    return {
      provider: 'razorpay',
      orderId: order.id,
      amountPaise: Number(order.amount),
      currency: order.currency,
      isDemo: isTestMode
    };
  }

  async verifyPayment(payload: VerifyPaymentPayload): Promise<{ success: boolean; error?: string }> {
    const { orderId, paymentId, signature } = payload;
    if (!orderId || !paymentId || !signature) {
      return { success: false, error: 'Missing required Razorpay order, payment, or signature parameters.' };
    }

    const { keySecret } = this.getClient();
    const body = `${orderId}|${paymentId}`;

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return { success: false, error: 'Invalid HMAC payment signature. Verification failed.' };
    }

    return { success: true };
  }
}

/**
 * Returns active provider depending on environment configuration.
 * Never silently falls back if razorpay is chosen but missing credentials.
 */
export function getActivePaymentProvider(): PaymentProvider {
  const provider = getPaymentProviderName();
  if (provider === 'razorpay') {
    return new RazorpayPaymentProvider();
  }
  return new DemoPaymentProvider();
}

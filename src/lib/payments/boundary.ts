/**
 * Payment Provider Abstraction Layer
 * 
 * Strict boundary ensuring that ONLY the DEMO provider is active now.
 * Live Razorpay transactions are strictly disabled in this phase.
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

export interface PaymentProvider {
  name: 'demo' | 'razorpay';
  createOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  verifyPayment(payload: {
    orderId: string;
    paymentId: string;
    signature?: string;
  }): Promise<{ success: boolean; error?: string }>;
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

  async verifyPayment(payload: { orderId: string; paymentId: string }): Promise<{ success: boolean; error?: string }> {
    if (!payload.orderId || !payload.paymentId) {
      return { success: false, error: 'Missing demo order or payment reference' };
    }
    return { success: true };
  }
}

/**
 * Razorpay implementation stub (Disabled by default)
 * To enable in Phase 2:
 * 1. Obtain RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from dashboard.razorpay.com
 * 2. Add to server environment variables (NEVER NEXT_PUBLIC_)
 * 3. Implement HMAC SHA256 signature verification:
 *    crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex') === signature
 * 4. Register official webhook endpoint /api/webhooks/razorpay with raw body verification.
 */
export class RazorpayPaymentProvider implements PaymentProvider {
  name = 'razorpay' as const;

  async createOrder(): Promise<PaymentOrderResult> {
    throw new Error('Razorpay live payments are disabled in this phase. Use DemoPaymentProvider.');
  }

  async verifyPayment(): Promise<{ success: boolean; error?: string }> {
    throw new Error('Razorpay verification is disabled in this phase.');
  }
}

// Factory returns ONLY the demo provider currently
export function getActivePaymentProvider(): PaymentProvider {
  return new DemoPaymentProvider();
}

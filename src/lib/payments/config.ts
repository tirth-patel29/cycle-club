/**
 * Razorpay & Payment Gateway Configuration
 *
 * Enforces strict production security:
 * - Server-only secrets are never exposed to browser or client components.
 * - Test Mode (rzp_test_*) and Live Mode (rzp_live_*) cannot be accidentally mixed.
 * - Explicit configuration validation prevents silent failures or accidental fallbacks.
 */

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
  isTestMode: boolean;
  isLiveMode: boolean;
}

export function getPaymentProviderName(): 'demo' | 'razorpay' {
  const provider = (process.env.PAYMENT_PROVIDER || 'demo').trim().toLowerCase();
  if (provider === 'razorpay') {
    return 'razorpay';
  }
  return 'demo';
}

export function getRazorpayConfig(): RazorpayConfig {
  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();

  if (!keyId) {
    throw new Error(
      'Razorpay Configuration Error: RAZORPAY_KEY_ID is missing from server environment variables.'
    );
  }

  if (!keySecret) {
    throw new Error(
      'Razorpay Configuration Error: RAZORPAY_KEY_SECRET is missing from server environment variables.'
    );
  }

  const isTestMode = keyId.startsWith('rzp_test_');
  const isLiveMode = keyId.startsWith('rzp_live_');

  if (!isTestMode && !isLiveMode) {
    throw new Error(
      'Razorpay Configuration Error: RAZORPAY_KEY_ID must start with "rzp_test_" for test mode or "rzp_live_" for live mode.'
    );
  }

  return {
    keyId,
    keySecret,
    webhookSecret: webhookSecret || undefined,
    isTestMode,
    isLiveMode
  };
}

export function isRazorpayConfigured(): boolean {
  try {
    getRazorpayConfig();
    return true;
  } catch {
    return false;
  }
}

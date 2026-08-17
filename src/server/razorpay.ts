import crypto from 'crypto';

export interface RazorpayPaymentResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id?: string;
  invoice_id?: string;
  international?: boolean;
  method?: string;
  amount_refunded?: number;
  refund_status?: string | null;
  captured?: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email?: string;
  contact?: string;
  notes?: Record<string, any>;
  fee?: number;
  tax?: number;
  error_code?: string | null;
  error_description?: string | null;
  created_at?: number;
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
  payment?: RazorpayPaymentResponse;
}

/**
 * Verifies a payment ID directly against the Razorpay Payments REST API.
 * Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.
 */
export async function verifyPaymentWithRazorpayApi(paymentId: string): Promise<VerificationResult> {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  const cleanPaymentId = paymentId.trim();

  // Basic regex sanity check
  if (!cleanPaymentId.startsWith('pay_') || cleanPaymentId.length < 10) {
    return {
      valid: false,
      error: 'Invalid Razorpay Payment ID format. Valid payment IDs start with "pay_" followed by at least 10 alphanumeric characters.',
    };
  }

  if (!keyId || !keySecret) {
    return {
      valid: false,
      error: 'Razorpay API credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) must be set in your Environment Variables / Secrets to verify live payments against the Razorpay Gateway.',
    };
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(cleanPaymentId)}`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      const desc = errJson?.error?.description || `Razorpay returned HTTP ${response.status}`;
      return {
        valid: false,
        error: `Razorpay payment verification failed: ${desc}. Please verify that you paid on the official gateway page.`,
      };
    }

    const data = (await response.json()) as RazorpayPaymentResponse;

    // Check payment capture/auth status
    if (data.status !== 'captured' && data.status !== 'authorized') {
      return {
        valid: false,
        error: `Payment is currently in '${data.status}' state. Only captured and successful payments can unlock FleetBot.`,
      };
    }

    // Check payment currency
    if (data.currency && data.currency.toUpperCase() !== 'INR') {
      return {
        valid: false,
        error: `Invalid currency (${data.currency}). Expected INR.`,
      };
    }

    // Check payment amount (minimum ₹49.00 = 4900 paise)
    if (typeof data.amount === 'number' && data.amount < 4900) {
      return {
        valid: false,
        error: `Payment amount (₹${(data.amount / 100).toFixed(2)}) is less than the required ₹49.00 for the 1-Year FleetBot pass.`,
      };
    }

    return {
      valid: true,
      payment: data,
    };
  } catch (err: any) {
    console.error('Error contacting Razorpay API:', err);
    return {
      valid: false,
      error: `Could not reach Razorpay API server: ${err.message || 'Network error'}`,
    };
  }
}

/**
 * Verifies Razorpay Webhook HMAC-SHA256 signature
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string, secret?: string): boolean {
  const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || !signature) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
  } catch (e) {
    console.error('Webhook signature verification error:', e);
    return false;
  }
}

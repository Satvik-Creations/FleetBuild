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
    console.warn('[Razorpay API] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in server environment variables.');
    return {
      valid: false,
      error: 'We could not confirm this transaction with the payment gateway. Please ensure your ₹49 payment completed successfully on the Razorpay portal or try again in a few moments.',
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
      console.warn(`[Razorpay Gateway] Payment lookup failed for ${cleanPaymentId}: HTTP ${response.status}`, errJson);
      return {
        valid: false,
        error: 'No matching payment record was found on Razorpay. Please verify the Payment ID from your Razorpay receipt (e.g. pay_...) and try again.',
      };
    }

    const data = (await response.json()) as RazorpayPaymentResponse;

    // Check payment capture/auth status
    if (data.status !== 'captured' && data.status !== 'authorized') {
      return {
        valid: false,
        error: `This payment is currently ${data.status}. Only completed payments can activate FleetBot access.`,
      };
    }

    // Check payment currency
    if (data.currency && data.currency.toUpperCase() !== 'INR') {
      return {
        valid: false,
        error: `Payment currency (${data.currency}) is invalid. Expected INR.`,
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
      error: 'Unable to reach the payment verification server. Please check your internet connection and try again.',
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

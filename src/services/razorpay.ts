// Razorpay Frontend Integration Service
// Handles creating Razorpay orders via backend and opening the checkout modal

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

// Declare Razorpay on window (loaded via script tag in index.html)
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayFailedResponse) => void) => void;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailedResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

/**
 * Create a Razorpay order via backend
 */
export async function createRazorpayOrder(amountInRupees: number): Promise<{
  success: boolean;
  order_id?: string;
  key_id?: string;
  amount?: number;
  currency?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInRupees,
        receipt: `kstores_${Date.now()}`
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to create payment order' };
    }

    return {
      success: true,
      order_id: data.order_id,
      key_id: data.key_id,
      amount: data.amount,
      currency: data.currency,
    };
  } catch (err) {
    console.error('Razorpay create order error:', err);
    return {
      success: false,
      error: 'Unable to connect to payment server. Please check your internet connection or try Cash on Delivery.'
    };
  }
}

/**
 * Verify Razorpay payment signature via backend
 */
export async function verifyRazorpayPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }),
    });

    const data = await response.json();
    return { success: data.success, error: data.error };
  } catch (err) {
    console.error('Razorpay verify error:', err);
    return { success: false, error: 'Payment verification failed. Please contact store owner.' };
  }
}

/**
 * Open Razorpay checkout modal
 */
export function openRazorpayCheckout(options: {
  orderId: string;
  keyId: string;
  amountPaise: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  storeOrderId: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onFailure: (error: string) => void;
  onDismiss: () => void;
}): void {
  if (typeof window.Razorpay === 'undefined') {
    options.onFailure('Razorpay SDK not loaded. Please refresh the page and try again.');
    return;
  }

  const rzpOptions: RazorpayOptions = {
    key: options.keyId || RAZORPAY_KEY_ID,
    amount: options.amountPaise,
    currency: options.currency,
    name: 'K-Stores (కె-స్టోర్స్)',
    description: `Order ${options.storeOrderId} — Village Grocery Delivery`,
    order_id: options.orderId,
    handler: options.onSuccess,
    prefill: {
      name: options.customerName,
      contact: options.customerPhone.startsWith('+91')
        ? options.customerPhone
        : `+91${options.customerPhone.replace(/\D/g, '')}`,
      email: options.customerEmail || '',
    },
    notes: {
      store_order_id: options.storeOrderId,
      store_name: 'K-Stores Village Kirana',
    },
    theme: {
      color: '#15803d', // Emerald-700 to match K-Stores brand
    },
    modal: {
      ondismiss: options.onDismiss,
    },
  };

  const rzp = new window.Razorpay(rzpOptions);

  rzp.on('payment.failed', (response: RazorpayFailedResponse) => {
    options.onFailure(
      response.error?.description || 'Payment failed. Please try again or choose Cash on Delivery.'
    );
  });

  rzp.open();
}

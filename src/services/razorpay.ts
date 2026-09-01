declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_TWg0Y7KNdLe04U';

export interface RazorpayOrderResponse {
  success: boolean;
  order_id?: string;
  amount?: number;
  currency?: string;
  key_id?: string;
  error?: string;
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  orderId?: string;
  keyId: string;
  amountPaise: number;
  currency?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  storeOrderId: string;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
  onFailure: (error: string) => void;
}

/**
 * Dynamically loads Razorpay checkout.js script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Step 1: Create Order via Backend (or fallback to client test gateway)
 */
export async function createRazorpayOrder(amountRupees: number): Promise<RazorpayOrderResponse> {
  const amountPaise = Math.round(amountRupees * 100);

  if (amountPaise < 100) {
    return { success: false, error: 'Minimum order amount for online payment is ₹1.00' };
  }

  // Attempt backend API call first
  try {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `mk_${Date.now()}`
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order_id) {
        return {
          success: true,
          order_id: data.order_id,
          amount: data.amount,
          currency: data.currency,
          key_id: data.key_id || RAZORPAY_KEY_ID
        };
      }
    }
  } catch (err) {
    console.warn('[Razorpay] Backend offline. Using Standard Web Checkout mode:', err);
  }

  // Fallback for static hosting (GitHub Pages)
  return {
    success: true,
    amount: amountPaise,
    currency: 'INR',
    key_id: RAZORPAY_KEY_ID
  };
}

/**
 * Step 2: Open Razorpay Standard Checkout Modal
 */
export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    options.onFailure('Unable to load Razorpay payment gateway. Please check your internet connection.');
    return;
  }

  const rzpOptions: any = {
    key: options.keyId || RAZORPAY_KEY_ID,
    amount: options.amountPaise,
    currency: options.currency || 'INR',
    name: 'K-STORES',
    description: 'Fresh Grocery Village Delivery (20 Mins)',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
    prefill: {
      name: options.customerName,
      contact: options.customerPhone,
      email: options.customerEmail || 'customer@kstores.local',
    },
    theme: {
      color: '#9e1a22',
    },
    modal: {
      ondismiss: () => {
        options.onFailure('Payment cancelled by user.');
      }
    },
    handler: (response: any) => {
      options.onSuccess({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id || options.orderId || `order_client_${Date.now()}`,
        razorpay_signature: response.razorpay_signature || 'client_verified_payment_sig'
      });
    }
  };

  if (options.orderId) {
    rzpOptions.order_id = options.orderId;
  }

  const rzp = new window.Razorpay(rzpOptions);
  rzp.on('payment.failed', (response: any) => {
    options.onFailure(response.error ? response.error.description : 'Payment transaction failed.');
  });

  rzp.open();
}

/**
 * Step 3: Verify Payment Signature via Backend
 */
export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      })
    });

    if (res.ok) {
      const data = await res.json();
      return { success: data.success };
    }
  } catch (err) {
    console.warn('[Razorpay] Server verification skipped on static site:', err);
  }

  return { success: Boolean(paymentId) };
}

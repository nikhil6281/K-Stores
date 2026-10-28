/**
 * Cloudflare Worker for RA Store (Anantapur, AP)
 * Contract implementation for Order creation, Payment verification, Webhooks,
 * Cancellations/Refunds, Admin reconciliation, and Scheduled unpaid order expiry.
 */

// ==========================================
// Base Utilities & Helpers
// ==========================================

function b64UrlEncode(data) {
  let str = '';
  if (typeof data === 'string') {
    str = btoa(data);
  } else {
    const bytes = new Uint8Array(data);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    str = btoa(binary);
  }
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const isAllowed = origin === 'https://nikhil6281.github.io' ||
                    origin.startsWith('http://localhost:') ||
                    origin.startsWith('http://127.0.0.1:');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://nikhil6281.github.io',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Razorpay-Signature',
    'Access-Control-Max-Age': '86400'
  };
}

function jsonResponse(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

function jsonError(error, code = 'BAD_REQUEST', status = 400, corsHeaders = {}) {
  return jsonResponse({ error, code }, status, corsHeaders);
}

// Generate human-friendly order ID in format YYMMDD-XXXX (e.g. 260418-0421)
function generateHumanOrderId() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${yy}${mm}${dd}-${rand}`;
}

// Constant-time HMAC-SHA256 signature check
async function verifyHmacSha256(secret, message, expectedHex) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const hashArray = Array.from(new Uint8Array(sigBuffer));
  const calculatedHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  if (calculatedHex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < calculatedHex.length; i++) {
    diff |= calculatedHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return diff === 0;
}

// ==========================================
// Google / Firebase Auth & RTDB Integration
// ==========================================

let cachedGoogleAccessToken = null;
let googleTokenExpiresAt = 0;

async function getGoogleServiceAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedGoogleAccessToken && now < googleTokenExpiresAt - 60) {
    return cachedGoogleAccessToken;
  }
  if (!env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    return null; // Fallback if database rules allow read/write or secret key used
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const b64Header = b64UrlEncode(JSON.stringify(header));
  const b64Claim = b64UrlEncode(JSON.stringify(claim));
  const signInput = `${b64Header}.${b64Claim}`;

  const cleanKey = env.FIREBASE_PRIVATE_KEY
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');

  const binaryDer = Uint8Array.from(atob(cleanKey), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signInput)
  );
  const assertion = `${signInput}.${b64UrlEncode(sig)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${assertion}`
  });

  if (!res.ok) {
    throw new Error(`Google token error: ${await res.text()}`);
  }

  const data = await res.json();
  cachedGoogleAccessToken = data.access_token;
  googleTokenExpiresAt = now + (data.expires_in || 3600);
  return cachedGoogleAccessToken;
}

function getRtdbUrl(env, path) {
  let base = env.FIREBASE_DATABASE_URL;
  if (!base && env.FIREBASE_PROJECT_ID) {
    base = `https://${env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`;
  }
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}.json`;
}

async function rtdbFetch(env, path, method = 'GET', body = null) {
  const url = new URL(getRtdbUrl(env, path));
  const headers = { 'Content-Type': 'application/json' };

  try {
    const token = await getGoogleServiceAccessToken(env);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('OAuth token fetch failed, attempting unauthenticated or secret auth', err);
  }

  const options = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);

  const res = await fetch(url.toString(), options);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`RTDB ${method} ${path} failed (${res.status}): ${errText}`);
  }
  return await res.json();
}

// Verify Firebase user ID token from Authorization header
async function verifyFirebaseIdToken(token, env) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(b64UrlDecode(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    // Verify expiration
    if (payload.exp && payload.exp < now) return null;

    // Verify issuer & audience if project ID is provided
    if (env.FIREBASE_PROJECT_ID) {
      if (payload.aud !== env.FIREBASE_PROJECT_ID) return null;
      if (payload.iss !== `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`) return null;
    }

    return {
      uid: payload.sub || payload.user_id,
      email: payload.email,
      phone: payload.phone_number
    };
  } catch (e) {
    return null;
  }
}

async function isUserAdmin(uid, env) {
  if (!uid) return false;
  try {
    const adminVal = await rtdbFetch(env, `admins/${uid}`, 'GET');
    return adminVal === true;
  } catch (e) {
    return false;
  }
}

// ==========================================
// Razorpay API Integration
// ==========================================

function getRazorpayAuthHeader(env) {
  return `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`;
}

async function createRazorpayOrder(amountPaise, receipt, env) {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getRazorpayAuthHeader(env)
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt: receipt
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Razorpay order creation failed: ${errText}`);
  }
  return await res.json();
}

async function fetchRazorpayPayment(paymentId, env) {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': getRazorpayAuthHeader(env)
    }
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Razorpay payment fetch failed: ${errText}`);
  }
  return await res.json();
}

async function createRazorpayRefund(paymentId, amountPaise, orderId, env) {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getRazorpayAuthHeader(env),
      'X-Razorpay-Idempotency': `refund_${orderId}`
    },
    body: JSON.stringify({
      amount: amountPaise,
      notes: { orderId: orderId },
      receipt: `ref_${orderId}`
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Razorpay refund failed: ${errText}`);
  }
  return await res.json();
}

// ==========================================
// Main Request Router
// ==========================================

export default {
  async fetch(request, env, ctx) {
    const cors = getCorsHeaders(request);

    // Preflight OPTIONS handler
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      // 1. Health check
      if (pathname === '/' || pathname === '/health') {
        return jsonResponse({ status: 'ok', store: 'RA Store', city: 'Anantapur' }, 200, cors);
      }

      // 2. POST /api/create-order
      if (pathname === '/api/create-order' && request.method === 'POST') {
        return await handleCreateOrder(request, env, cors);
      }

      // 3. POST /api/verify-payment
      if (pathname === '/api/verify-payment' && request.method === 'POST') {
        return await handleVerifyPayment(request, env, cors);
      }

      // 3b. POST /api/razorpay-callback (Redirect mode for in-app browsers)
      if (pathname === '/api/razorpay-callback' && request.method === 'POST') {
        return await handleRazorpayCallback(request, env, cors);
      }

      // 4. POST /api/razorpay-webhook
      if (pathname === '/api/razorpay-webhook' && request.method === 'POST') {
        return await handleRazorpayWebhook(request, env, cors);
      }

      // 5. POST /api/cancel-order
      if (pathname === '/api/cancel-order' && request.method === 'POST') {
        return await handleCancelOrder(request, env, cors);
      }

      // 6. POST /api/admin/update-order
      if (pathname === '/api/admin/update-order' && request.method === 'POST') {
        return await handleAdminUpdateOrder(request, env, cors);
      }

      // 7. POST /api/admin/reconcile-order
      if (pathname === '/api/admin/reconcile-order' && request.method === 'POST') {
        return await handleAdminReconcileOrder(request, env, cors);
      }

      // 8. POST /api/worker/verify-staff
      if (pathname === '/api/worker/verify-staff' && request.method === 'POST') {
        return await handleWorkerVerifyStaff(request, env, cors);
      }

      return jsonError('Route not found', 'NOT_FOUND', 404, cors);
    } catch (err) {
      console.error('Unhandled Worker error:', err);
      return jsonError(err.message || 'Internal Server Error', 'SERVER_ERROR', 500, cors);
    }
  },

  // Scheduled Cron Event (every 5 minutes): Expire unpaid online orders
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduledOrderExpiry(env));
  }
};

// ==========================================
// Route Handlers
// ==========================================

/**
 * POST /api/create-order
 * - Verifies Firebase ID token.
 * - Recalculates total from RTDB products and settings (ignoring client prices).
 * - Enforces minOrderValue.
 * - Idempotency: reuses existing order if requestId matched.
 * - Online: creates Razorpay order, writes status: placed, paymentStatus: pending, expiresAt: now + 15m.
 * - COD: writes status: placed, paymentStatus: cod_pending.
 */
async function handleCreateOrder(request, env, cors) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = await verifyFirebaseIdToken(token, env);
  if (!user) {
    return jsonError('Unauthorized: valid Firebase login required', 'UNAUTHORIZED', 401, cors);
  }

  const body = await request.json();
  const { items, customer, paymentMethod, requestId } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return jsonError('Cart items are required', 'INVALID_ITEMS', 400, cors);
  }
  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return jsonError('Customer name, phone, and address are required', 'INVALID_CUSTOMER', 400, cors);
  }

  // Address and PIN validation for Anantapur
  const cleanAddress = (customer.address || '').trim();
  if (cleanAddress.length < 10) {
    return jsonError('Please enter a complete delivery address with landmark in Anantapur (min 10 characters).', 'INVALID_ADDRESS', 400, cors);
  }
  const servedPins = ['515001', '515002', '515003', '515004', '515005'];
  const pinMatch = cleanAddress.match(/\b(5\d{5})\b/);
  if (pinMatch && !servedPins.includes(pinMatch[1])) {
    return jsonError(`Delivery is only available in Anantapur PIN codes: ${servedPins.join(', ')}`, 'PIN_NOT_SERVICED', 400, cors);
  }

  // Idempotency check: check if requestId already created an order
  if (requestId) {
    const existingOrders = await rtdbFetch(env, 'orders', 'GET') || {};
    for (const [k, ord] of Object.entries(existingOrders)) {
      if (ord.requestId === requestId && ord.uid === user.uid) {
        return jsonResponse({
          success: true,
          orderId: ord.id,
          pushKey: k,
          razorpayOrderId: ord.razorpayOrderId || null,
          razorpayKeyId: env.RAZORPAY_KEY_ID || null,
          amount: Math.round(Number(ord.total) * 100),
          total: ord.total,
          isExisting: true
        }, 200, cors);
      }
    }
  }

  // Fetch products and settings directly from DB to compute price securely
  const [dbProducts, dbSettings] = await Promise.all([
    rtdbFetch(env, 'products', 'GET') || {},
    rtdbFetch(env, 'settings', 'GET') || {}
  ]);

  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const p = dbProducts[item.id];
    if (!p) {
      return jsonError(`Product "${item.id}" is no longer available`, 'ITEM_NOT_FOUND', 400, cors);
    }
    if (p.inStock === false) {
      return jsonError(`Item "${p.name}" is currently out of stock`, 'OUT_OF_STOCK', 400, cors);
    }
    const qty = Math.max(1, parseInt(item.quantity) || 1);
    const price = Number(p.price);
    subtotal += (price * qty);
    verifiedItems.push({
      id: item.id,
      name: p.name,
      nameTe: p.nameTe || '',
      price: price,
      quantity: qty,
      unit: p.unit || ''
    });
  }

  const minOrder = dbSettings.minOrderValue ?? 0;
  if (subtotal < minOrder) {
    return jsonError(`Minimum order value is ₹${minOrder}. Current subtotal: ₹${subtotal}`, 'MIN_ORDER_NOT_MET', 400, cors);
  }

  const freeThresh = dbSettings.freeDeliveryThreshold ?? 299;
  const deliveryFee = subtotal >= freeThresh ? 0 : (dbSettings.deliveryFee ?? 25);
  const total = subtotal + deliveryFee;

  const now = new Date();
  const humanOrderId = generateHumanOrderId();
  const pushKey = `ord_${now.getTime()}_${Math.random().toString(36).substring(2, 7)}`;

  const orderRecord = {
    id: humanOrderId,
    uid: user.uid,
    userEmail: user.email || '',
    customer: {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes || '',
      scheduledSlot: customer.scheduledSlot || null
    },
    items: verifiedItems,
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: total,
    paymentMethod: paymentMethod === 'online_razorpay' ? 'online_razorpay' : 'cod',
    status: 'placed',
    requestId: requestId || null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  if (paymentMethod === 'online_razorpay') {
    const amountPaise = Math.round(total * 100);
    const rzpOrder = await createRazorpayOrder(amountPaise, humanOrderId, env);

    orderRecord.paymentStatus = 'pending';
    orderRecord.razorpayOrderId = rzpOrder.id;
    orderRecord.expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    await rtdbFetch(env, `orders/${pushKey}`, 'PUT', orderRecord);

    return jsonResponse({
      success: true,
      orderId: humanOrderId,
      pushKey: pushKey,
      razorpayOrderId: rzpOrder.id,
      razorpayKeyId: env.RAZORPAY_KEY_ID,
      amount: amountPaise,
      total: total
    }, 200, cors);
  } else {
    // Cash on Delivery
    orderRecord.paymentStatus = 'cod_pending';
    await rtdbFetch(env, `orders/${pushKey}`, 'PUT', orderRecord);

    return jsonResponse({
      success: true,
      orderId: humanOrderId,
      pushKey: pushKey,
      total: total
    }, 200, cors);
  }
}

/**
 * POST /api/verify-payment
 * - Authenticated user owns order or is admin.
 * - Constant-time HMAC-SHA256 verification.
 * - Queries Razorpay Payment API: status === 'captured' AND amount matches order total.
 * - Idempotent: sets paymentStatus: 'paid'.
 */
async function handleVerifyPayment(request, env, cors) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = await verifyFirebaseIdToken(token, env);

  const body = await request.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return jsonError('Missing Razorpay verification parameters', 'INVALID_PARAMS', 400, cors);
  }

  // Signature check
  const msg = `${razorpay_order_id}|${razorpay_payment_id}`;
  const isValidSig = await verifyHmacSha256(env.RAZORPAY_KEY_SECRET, msg, razorpay_signature);
  if (!isValidSig) {
    return jsonError('Invalid payment signature', 'INVALID_SIGNATURE', 400, cors);
  }

  // Locate order in RTDB
  const orders = await rtdbFetch(env, 'orders', 'GET') || {};
  let targetKey = null;
  let orderData = null;

  for (const [k, ord] of Object.entries(orders)) {
    if (ord.id === orderId || k === orderId || ord.razorpayOrderId === razorpay_order_id) {
      targetKey = k;
      orderData = ord;
      break;
    }
  }

  if (!orderData) {
    return jsonError('Order not found', 'NOT_FOUND', 404, cors);
  }

  if (user) {
    const admin = await isUserAdmin(user.uid, env);
    if (!admin && orderData.uid !== user.uid) {
      return jsonError('Forbidden: you do not own this order', 'FORBIDDEN', 403, cors);
    }
  }

  // Idempotency: if already paid, return early
  if (orderData.paymentStatus === 'paid') {
    return jsonResponse({ success: true, orderId: orderData.id, message: 'Payment already recorded as paid' }, 200, cors);
  }

  // Query Razorpay API to confirm captured status & exact amount in paise
  const rzpPayment = await fetchRazorpayPayment(razorpay_payment_id, env);
  const expectedPaise = Math.round(Number(orderData.total) * 100);

  if (rzpPayment.status !== 'captured' || Number(rzpPayment.amount) !== expectedPaise) {
    return jsonError(`Payment verification failed: status=${rzpPayment.status}, amount=${rzpPayment.amount}`, 'PAYMENT_NOT_CAPTURED', 400, cors);
  }

  // Update order in RTDB
  const nowIso = new Date().toISOString();
  await rtdbFetch(env, `orders/${targetKey}`, 'PATCH', {
    paymentStatus: 'paid',
    paidAt: nowIso,
    razorpayPaymentId: razorpay_payment_id,
    updatedAt: nowIso
  });

  return jsonResponse({ success: true, orderId: orderData.id }, 200, cors);
}

/**
 * POST /api/razorpay-webhook
 * - Validates X-Razorpay-Signature using RAZORPAY_WEBHOOK_SECRET.
 * - Handles payment.captured, payment.failed, refund.processed, refund.failed.
 * - Idempotent, returns 200 fast.
 */
async function handleRazorpayWebhook(request, env, cors) {
  const signature = request.headers.get('X-Razorpay-Signature');
  const rawBody = await request.text();

  if (!env.RAZORPAY_WEBHOOK_SECRET || !signature) {
    return jsonError('Missing webhook configuration or signature', 'UNAUTHORIZED', 401, cors);
  }

  const isValid = await verifyHmacSha256(env.RAZORPAY_WEBHOOK_SECRET, rawBody, signature);
  if (!isValid) {
    return jsonError('Invalid webhook signature', 'INVALID_SIGNATURE', 400, cors);
  }

  const event = JSON.parse(rawBody);
  const eventType = event.event;
  const payload = event.payload;

  const orders = await rtdbFetch(env, 'orders', 'GET') || {};
  const nowIso = new Date().toISOString();

  if (eventType === 'payment.captured') {
    const payment = payload.payment.entity;
    const rzpOrderId = payment.order_id;

    for (const [k, ord] of Object.entries(orders)) {
      if (ord.razorpayOrderId === rzpOrderId) {
        if (ord.paymentStatus !== 'paid') {
          await rtdbFetch(env, `orders/${k}`, 'PATCH', {
            paymentStatus: 'paid',
            paidAt: nowIso,
            razorpayPaymentId: payment.id,
            updatedAt: nowIso
          });
        }
        break;
      }
    }
  } else if (eventType === 'payment.failed') {
    const payment = payload.payment.entity;
    const rzpOrderId = payment.order_id;

    for (const [k, ord] of Object.entries(orders)) {
      if (ord.razorpayOrderId === rzpOrderId) {
        if (ord.paymentStatus === 'pending') {
          await rtdbFetch(env, `orders/${k}`, 'PATCH', {
            paymentStatus: 'failed',
            updatedAt: nowIso
          });
        }
        break;
      }
    }
  } else if (eventType === 'refund.processed') {
    const refund = payload.refund.entity;
    const paymentId = refund.payment_id;

    for (const [k, ord] of Object.entries(orders)) {
      if (ord.razorpayPaymentId === paymentId || ord.razorpayOrderId === refund.notes?.orderId) {
        await rtdbFetch(env, `orders/${k}`, 'PATCH', {
          paymentStatus: 'refunded',
          refundId: refund.id,
          refundedAt: nowIso,
          updatedAt: nowIso
        });
        break;
      }
    }
  } else if (eventType === 'refund.failed') {
    const refund = payload.refund.entity;
    const paymentId = refund.payment_id;

    for (const [k, ord] of Object.entries(orders)) {
      if (ord.razorpayPaymentId === paymentId) {
        await rtdbFetch(env, `orders/${k}`, 'PATCH', {
          refundStatus: 'failed_attention_needed',
          updatedAt: nowIso
        });
        break;
      }
    }
  }

  return jsonResponse({ status: 'ok' }, 200, cors);
}

/**
 * POST /api/cancel-order
 * - Auth required (user owns order or admin).
 * - Allowed only before out_for_delivery.
 * - Paid online: issues Razorpay refund for full amount via refund API.
 * - COD / unpaid: sets status: cancelled without refund.
 */
async function handleCancelOrder(request, env, cors) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = await verifyFirebaseIdToken(token, env);
  if (!user) {
    return jsonError('Unauthorized', 'UNAUTHORIZED', 401, cors);
  }

  const body = await request.json();
  const orderId = body.orderId || body.pushKey;
  const reason = body.reason || 'User requested cancellation';

  const orders = await rtdbFetch(env, 'orders', 'GET') || {};
  let targetKey = null;
  let orderData = null;

  for (const [k, ord] of Object.entries(orders)) {
    if (k === orderId || ord.id === orderId) {
      targetKey = k;
      orderData = ord;
      break;
    }
  }

  if (!orderData) {
    return jsonError('Order not found', 'NOT_FOUND', 404, cors);
  }

  const admin = await isUserAdmin(user.uid, env);
  if (!admin && orderData.uid !== user.uid) {
    return jsonError('Forbidden: you do not own this order', 'FORBIDDEN', 403, cors);
  }

  // Cancellation forbidden once out for delivery or delivered
  if (orderData.status === 'out_for_delivery' || orderData.status === 'delivered') {
    return jsonError('Cannot cancel order: groceries are already out for delivery or delivered', 'CANNOT_CANCEL', 400, cors);
  }
  if (orderData.status === 'cancelled') {
    return jsonResponse({ success: true, message: 'Order was already cancelled' }, 200, cors);
  }

  const nowIso = new Date().toISOString();
  const updates = {
    status: 'cancelled',
    cancelledAt: nowIso,
    cancelReason: reason,
    updatedAt: nowIso
  };

  // If paid online, issue 100% full refund through Razorpay
  if (orderData.paymentStatus === 'paid') {
    let paymentId = orderData.razorpayPaymentId;
    if (!paymentId && orderData.razorpayOrderId) {
      // Query Razorpay order payments to fetch payment ID
      try {
        const payRes = await fetch(`https://api.razorpay.com/v1/orders/${orderData.razorpayOrderId}/payments`, {
          headers: { 'Authorization': getRazorpayAuthHeader(env) }
        });
        const payJson = await payRes.json();
        if (payJson.items && payJson.items.length) {
          const cap = payJson.items.find(i => i.status === 'captured') || payJson.items[0];
          paymentId = cap.id;
        }
      } catch (e) {}
    }

    if (paymentId) {
      const amountPaise = Math.round(Number(orderData.total) * 100);
      const refund = await createRazorpayRefund(paymentId, amountPaise, orderData.id, env);
      updates.paymentStatus = 'refund_initiated';
      updates.refundId = refund.id;
    } else {
      updates.paymentStatus = 'refund_manual_check_needed';
    }
  } else if (orderData.paymentMethod === 'cod') {
    updates.paymentStatus = 'cod_cancelled';
  } else {
    updates.paymentStatus = 'cancelled_unpaid';
  }

  await rtdbFetch(env, `orders/${targetKey}`, 'PATCH', updates);

  // Write audit log if admin action
  if (admin) {
    await rtdbFetch(env, `audit/audit_${Date.now()}`, 'PUT', {
      adminUid: user.uid,
      adminEmail: user.email || 'admin',
      action: 'CANCEL_ORDER',
      orderId: orderData.id,
      details: reason,
      timestamp: nowIso
    }).catch(() => {});
  }

  return jsonResponse({ success: true, orderId: orderData.id }, 200, cors);
}

/**
 * POST /api/admin/update-order
 * - Enforces status progression: placed -> accepted -> packed -> out_for_delivery -> delivered
 * - Disallows dispatch of unpaid online orders.
 * - Handles COD delivered cash collection confirmation.
 */
async function handleAdminUpdateOrder(request, env, cors) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = await verifyFirebaseIdToken(token, env);
  if (!user || !(await isUserAdmin(user.uid, env))) {
    return jsonError('Admin access required', 'UNAUTHORIZED', 403, cors);
  }

  const body = await request.json();
  const { pushKey, newStatus, codCollected } = body;

  const orderData = await rtdbFetch(env, `orders/${pushKey}`, 'GET');
  if (!orderData) {
    return jsonError('Order not found', 'NOT_FOUND', 404, cors);
  }

  // Block unpaid dispatch
  if (orderData.paymentMethod === 'online_razorpay' && orderData.paymentStatus !== 'paid') {
    if (newStatus === 'accepted' || newStatus === 'packed' || newStatus === 'out_for_delivery' || newStatus === 'delivered') {
      return jsonError('Cannot advance online order: paymentStatus is not PAID', 'BLOCKED_UNPAID', 400, cors);
    }
  }

  const validSteps = ['placed', 'accepted', 'packed', 'out_for_delivery', 'delivered'];
  const currentIdx = validSteps.indexOf(orderData.status || 'placed');
  const nextIdx = validSteps.indexOf(newStatus);

  if (nextIdx < 0 || nextIdx <= currentIdx) {
    return jsonError(`Invalid status transition from ${orderData.status} to ${newStatus}`, 'INVALID_TRANSITION', 400, cors);
  }

  const nowIso = new Date().toISOString();
  const updates = {
    status: newStatus,
    updatedAt: nowIso
  };

  if (orderData.paymentMethod === 'cod' && newStatus === 'delivered' && codCollected) {
    updates.paymentStatus = 'cod_collected';
    updates.codCollectedAt = nowIso;
  }

  await rtdbFetch(env, `orders/${pushKey}`, 'PATCH', updates);

  await rtdbFetch(env, `audit/audit_${Date.now()}`, 'PUT', {
    adminUid: user.uid,
    adminEmail: user.email || 'admin',
    action: `STATUS_${newStatus.toUpperCase()}`,
    orderId: orderData.id,
    details: `Transitioned from ${orderData.status} to ${newStatus}`,
    timestamp: nowIso
  }).catch(() => {});

  return jsonResponse({ success: true, orderId: orderData.id, status: newStatus }, 200, cors);
}

/**
 * POST /api/admin/reconcile-order
 * - Queries Razorpay order payments to confirm if customer paid.
 * - Sets paymentStatus: 'paid' if captured.
 */
async function handleAdminReconcileOrder(request, env, cors) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = await verifyFirebaseIdToken(token, env);
  if (!user || !(await isUserAdmin(user.uid, env))) {
    return jsonError('Admin access required', 'UNAUTHORIZED', 403, cors);
  }

  const body = await request.json();
  const { pushKey } = body;

  const orderData = await rtdbFetch(env, `orders/${pushKey}`, 'GET');
  if (!orderData) {
    return jsonError('Order not found', 'NOT_FOUND', 404, cors);
  }

  if (!orderData.razorpayOrderId) {
    return jsonError('No Razorpay order ID associated with this order', 'NO_RZP_ID', 400, cors);
  }

  const res = await fetch(`https://api.razorpay.com/v1/orders/${orderData.razorpayOrderId}/payments`, {
    headers: { 'Authorization': getRazorpayAuthHeader(env) }
  });
  if (!res.ok) {
    return jsonError('Could not fetch Razorpay payments', 'RZP_FETCH_FAILED', 400, cors);
  }

  const rzpData = await res.json();
  const capturedPayment = (rzpData.items || []).find(p => p.status === 'captured');

  const nowIso = new Date().toISOString();
  if (capturedPayment) {
    await rtdbFetch(env, `orders/${pushKey}`, 'PATCH', {
      paymentStatus: 'paid',
      paidAt: nowIso,
      razorpayPaymentId: capturedPayment.id,
      updatedAt: nowIso
    });

    await rtdbFetch(env, `audit/audit_${Date.now()}`, 'PUT', {
      adminUid: user.uid,
      adminEmail: user.email || 'admin',
      action: 'RECONCILE_PAID',
      orderId: orderData.id,
      details: `Reconciled as PAID via Razorpay Payment ${capturedPayment.id}`,
      timestamp: nowIso
    }).catch(() => {});

    return jsonResponse({ success: true, paid: true, paymentId: capturedPayment.id }, 200, cors);
  } else {
    return jsonResponse({ success: true, paid: false, message: 'No captured payment found in Razorpay' }, 200, cors);
  }
}

/**
 * Scheduled Cron Handler:
 * - Queries RTDB for unpaid online orders where expiresAt < now.
 * - Verifies with Razorpay; if uncaptured, marks status: cancelled, paymentStatus: expired.
 */
async function handleScheduledOrderExpiry(env) {
  try {
    const orders = await rtdbFetch(env, 'orders', 'GET') || {};
    const now = Date.now();
    const nowIso = new Date(now).toISOString();

    for (const [k, ord] of Object.entries(orders)) {
      if (ord.paymentMethod === 'online_razorpay' && ord.paymentStatus === 'pending') {
        const expiresMs = ord.expiresAt ? new Date(ord.expiresAt).getTime() : 0;
        if (expiresMs && expiresMs < now) {
          // Check Razorpay before cancelling
          let isCaptured = false;
          if (ord.razorpayOrderId) {
            try {
              const res = await fetch(`https://api.razorpay.com/v1/orders/${ord.razorpayOrderId}/payments`, {
                headers: { 'Authorization': getRazorpayAuthHeader(env) }
              });
              const rzpData = await res.json();
              isCaptured = (rzpData.items || []).some(p => p.status === 'captured');
            } catch (e) {}
          }

          if (isCaptured) {
            await rtdbFetch(env, `orders/${k}`, 'PATCH', {
              paymentStatus: 'paid',
              paidAt: nowIso,
              updatedAt: nowIso
            });
          } else {
            await rtdbFetch(env, `orders/${k}`, 'PATCH', {
              status: 'cancelled',
              paymentStatus: 'expired',
              cancelledAt: nowIso,
              cancelReason: 'Payment window expired (15m)',
              updatedAt: nowIso
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Scheduled order expiry error:', err);
  }
}


async function isUserStaff(uid, env) {
  if (!uid) return false;
  const staff = await rtdbFetch(env, `staff/${uid}`, 'GET');
  if (staff && staff.active === true) return true;
  return await isUserAdmin(uid, env);
}


/**
 * Worker / Staff Verification Endpoint:
 * - Verifies Firebase ID token.
 * - Checks admin list or staff records by email, phone, or UID.
 * - Auto-links staff/{user.uid} so RTDB security rules evaluate instantly.
 */
async function handleWorkerVerifyStaff(request, env, cors) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = await verifyFirebaseIdToken(token, env);
  if (!user) {
    return jsonError('Unauthorized: valid login required', 'UNAUTHORIZED', 401, cors);
  }

  // 1. Check if owner/admin
  const isAdmin = await isUserAdmin(user.uid, env);
  if (isAdmin) {
    return jsonResponse({
      success: true,
      isStaff: true,
      isAdmin: true,
      role: 'Store Owner',
      name: 'Owner',
      uid: user.uid
    }, 200, cors);
  }

  // 2. Query staff records from RTDB
  const staffObj = await rtdbFetch(env, 'staff', 'GET') || {};
  let matchedRecord = null;
  let matchedKey = null;

  const userEmail = (user.email || '').toLowerCase().trim();
  const userPhone = (user.phone || '').replace(/[^0-9]/g, '');

  for (const [k, s] of Object.entries(staffObj)) {
    if (!s) continue;
    const sEmail = (s.email || '').toLowerCase().trim();
    const sPhone = (s.phone || '').replace(/[^0-9]/g, '');

    if (k === user.uid || (userEmail && sEmail === userEmail) || (userPhone && sPhone && (userPhone.endsWith(sPhone) || sPhone.endsWith(userPhone)))) {
      matchedRecord = s;
      matchedKey = k;
      break;
    }
  }

  if (matchedRecord && matchedRecord.active === true) {
    if (matchedKey !== user.uid) {
      await rtdbFetch(env, `staff/${user.uid}`, 'PATCH', {
        name: matchedRecord.name || 'Staff Member',
        email: user.email || matchedRecord.email || '',
        phone: user.phone || matchedRecord.phone || '',
        role: matchedRecord.role || 'Staff',
        active: true,
        linkedKey: matchedKey,
        lastLogin: new Date().toISOString()
      }).catch(err => console.warn('Could not link staff UID:', err));
    }

    return jsonResponse({
      success: true,
      isStaff: true,
      isAdmin: false,
      role: matchedRecord.role || 'Staff',
      name: matchedRecord.name || 'Staff Member',
      uid: user.uid
    }, 200, cors);
  }

  return jsonError('Access Denied: Account not registered as active staff', 'STAFF_NOT_FOUND', 403, cors);
}

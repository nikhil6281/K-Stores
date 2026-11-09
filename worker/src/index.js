
// ==========================================
// Milestone 3: Geo Utilities & Validation
// ==========================================

function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isValidIndiaGeo(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return false;
  return (lat >= 6 && lat <= 38 && lng >= 68 && lng <= 98);
}

/**
 * Cloudflare Worker for Sri Sai (Anantapur, AP)
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
                    origin.startsWith('http://127.0.0.1:') ||
                    origin === 'capacitor://localhost' ||
                    origin === 'http://localhost' ||
                    origin.startsWith('https://localhost');
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
      'Cache-Control': 'no-store, no-cache, must-revalidate',
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
    scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/firebase.messaging',
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
        return jsonResponse({ status: 'ok', store: 'Sri Sai', city: 'Anantapur' }, 200, cors);
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
      if (pathname === '/api/razorpay-callback' && (request.method === 'POST' || request.method === 'GET')) {
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
      if (pathname === '/api/admin/refund-mismatch' && request.method === 'POST') {
        return await handleAdminRefundMismatch(request, env, cors);
      }

      if (pathname === '/api/admin/reconcile-order' && request.method === 'POST') {
        return await handleAdminReconcileOrder(request, env, cors);
      }

            // 8. POST /api/worker/verify-staff
      if (pathname === '/api/worker/verify-staff' && request.method === 'POST') {
        return await handleWorkerVerifyStaff(request, env, cors);
      }

      // 9. GET /api/catalog
      if (pathname === '/api/catalog' && request.method === 'GET') {
        return await handleGetCatalog(request, env, cors);
      }

      // 10. POST /api/verify-delivery-otp
      if (pathname === '/api/verify-delivery-otp' && request.method === 'POST') {
        return await handleVerifyDeliveryOtp(request, env, cors);
      }

      // 11. POST /api/admin/reissue-delivery-otp
      if (pathname === '/api/admin/reissue-delivery-otp' && request.method === 'POST') {
        return await handleAdminReissueDeliveryOtp(request, env, cors);
      }

      // 12. POST /api/admin/deliver-without-otp
      if (pathname === '/api/admin/deliver-without-otp' && request.method === 'POST') {
        return await handleAdminDeliverWithoutOtp(request, env, cors);
      }

      // 13. POST /api/admin/send-offer
      if (pathname === '/api/admin/send-offer' && request.method === 'POST') {
        return await handleAdminSendOffer(request, env, cors);
      }

      // 14. POST /api/record-offer-open
      if (pathname === '/api/record-offer-open' && request.method === 'POST') {
        return await handleRecordOfferOpen(request, env, cors);
      }

      // 15. POST /api/notify-order-status
      if (pathname === '/api/notify-order-status' && request.method === 'POST') {
        return await handleNotifyOrderStatus(request, env, cors);
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

    orderRecord.status = 'payment_pending';
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
  const patchData = {
    paymentStatus: 'paid',
    paidAt: nowIso,
    razorpayPaymentId: razorpay_payment_id,
    updatedAt: nowIso
  };
  if (orderData.status === 'payment_pending') {
    patchData.status = 'placed';
  }
  await rtdbFetch(env, `orders/${targetKey}`, 'PATCH', patchData);

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

  if (eventType === 'payment.captured' || eventType === 'order.paid') {
    const payment = payload.payment ? payload.payment.entity : null;
    const rzpOrderId = payment ? payment.order_id : (payload.order ? payload.order.entity.id : null);

    for (const [k, ord] of Object.entries(orders)) {
      if (ord.razorpayOrderId === rzpOrderId) {
        if (ord.paymentStatus !== 'paid') {
          const patchData = {
            paymentStatus: 'paid',
            paidAt: nowIso,
            razorpayPaymentId: payment ? payment.id : (ord.razorpayPaymentId || ''),
            updatedAt: nowIso
          };
          if (ord.status === 'payment_pending') {
            patchData.status = 'placed';
          }
          await rtdbFetch(env, `orders/${k}`, 'PATCH', patchData);
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
  await sendOrderStatusNotification(env, orderData, newStatus);

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
    const patchData = {
      paymentStatus: 'paid',
      paidAt: nowIso,
      razorpayPaymentId: capturedPayment.id,
      updatedAt: nowIso
    };
    if (orderData.status === 'payment_pending') {
      patchData.status = 'placed';
    }
    await rtdbFetch(env, `orders/${pushKey}`, 'PATCH', patchData);

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
            const patchData = {
              paymentStatus: 'paid',
              paidAt: nowIso,
              updatedAt: nowIso
            };
            if (ord.status === 'payment_pending') {
              patchData.status = 'placed';
            }
            await rtdbFetch(env, `orders/${k}`, 'PATCH', patchData);
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


// ==========================================
// Milestone 2: Delivery OTP Handlers
// ==========================================

async function isUserStaffOrAdmin(user, env) {
  if (!user || !user.uid) return false;
  if (await isUserAdmin(user.uid, env)) return true;
  try {
    const staffRecord = await rtdbFetch(env, `staff/${user.uid}`, 'GET');
    if (staffRecord && staffRecord.active === true) return true;
  } catch (e) {
    console.warn('Error checking staff status:', e);
  }
  return false;
}

/**
 * POST /api/verify-delivery-otp
 * - Caller must be authenticated active staff or owner.
 * - Order must be out_for_delivery.
 * - Checks attempts < 5 and lockedUntil.
 * - Constant-time comparison of 4-digit code.
 * - On success, sets status: delivered, deliveredAt, deliveredBy, otpVerified: true,
 *   and for COD marks paymentStatus: cod_collected with amount in an atomic audit log.
 */
async function handleVerifyDeliveryOtp(request, env, cors) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = await verifyFirebaseIdToken(token, env);
  if (!user) {
    return jsonError('Unauthorized: valid staff login required', 'UNAUTHORIZED', 401, cors);
  }

  const isStaffOrAdmin = await isUserStaffOrAdmin(user, env);
  if (!isStaffOrAdmin) {
    return jsonError('Forbidden: active staff or store owner access required', 'FORBIDDEN', 403, cors);
  }

  const body = await request.json().catch(() => ({}));
  const { orderPushKey, code } = body;

  if (!orderPushKey) {
    return jsonError('orderPushKey is required', 'INVALID_PARAM', 400, cors);
  }

  const order = await rtdbFetch(env, `orders/${orderPushKey}`, 'GET');
  if (!order) {
    return jsonError('Order not found', 'NOT_FOUND', 404, cors);
  }

  if (order.status === 'delivered') {
    return jsonResponse({
      success: true,
      orderId: order.id,
      status: 'delivered',
      alreadyDelivered: true,
      message: 'Order is already marked delivered'
    }, 200, cors);
  }

  if (order.status !== 'out_for_delivery') {
    return jsonError(`Order cannot be delivered in status "${order.status}". It must be "out_for_delivery".`, 'INVALID_STATUS', 400, cors);
  }

  const nowIso = new Date().toISOString();

  // If order does not require OTP
  if (order.otpRequired === false) {
    const updatePayload = {
      status: 'delivered',
      deliveredAt: nowIso,
      deliveredBy: user.uid,
      deliveredByName: user.email || user.name || 'Staff',
      otpVerified: false,
      updatedAt: nowIso
    };
    if (order.paymentMethod === 'cod') {
      updatePayload.paymentStatus = 'cod_collected';
      updatePayload.codCollected = Number(order.total) || 0;
      updatePayload.codCollectedAt = nowIso;
      updatePayload.codCollectedBy = user.email || 'staff';
    }
    await rtdbFetch(env, `orders/${orderPushKey}`, 'PATCH', updatePayload);
    await rtdbFetch(env, `audit/aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, 'PUT', {
      adminUid: user.uid,
      adminEmail: user.email || 'staff',
      action: 'DELIVERY_COMPLETED_NO_OTP',
      orderId: order.id,
      timestamp: nowIso
    });
    return jsonResponse({ success: true, orderId: order.id, status: 'delivered', otpVerified: false }, 200, cors);
  }

  // Fetch private record
  const privateRecord = await rtdbFetch(env, `orderPrivate/${orderPushKey}`, 'GET');
  if (!privateRecord || !privateRecord.code) {
    return jsonError('No delivery OTP record found. Please ask store owner to reissue delivery code.', 'NO_OTP_RECORD', 400, cors);
  }

  const now = Date.now();
  if (privateRecord.lockedUntil && privateRecord.lockedUntil > now) {
    const remMins = Math.ceil((privateRecord.lockedUntil - now) / 60000);
    return jsonError(`Verification is LOCKED due to 5 failed attempts. Please wait ${remMins} min or ask store owner for override.`, 'OTP_LOCKED', 423, cors);
  }

  const cleanCode = String(code || '').trim();
  if (!/^\d{4}$/.test(cleanCode)) {
    return jsonError('Please enter a 4-digit numeric code', 'INVALID_FORMAT', 400, cors);
  }

  // Constant-time comparison
  const expected = String(privateRecord.code).trim();
  let diff = expected.length ^ cleanCode.length;
  for (let i = 0; i < expected.length && i < cleanCode.length; i++) {
    diff |= expected.charCodeAt(i) ^ cleanCode.charCodeAt(i);
  }

  if (diff !== 0) {
    const attempts = (privateRecord.attempts || 0) + 1;
    const isNowLocked = attempts >= 5;
    const lockedUntil = isNowLocked ? (now + 30 * 60 * 1000) : 0;

    await rtdbFetch(env, `orderPrivate/${orderPushKey}`, 'PATCH', {
      attempts: attempts,
      lockedUntil: lockedUntil
    });

    if (isNowLocked) {
      await rtdbFetch(env, `audit/aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, 'PUT', {
        adminUid: user.uid,
        adminEmail: user.email || 'staff',
        action: 'DELIVERY_OTP_LOCKED_5_FAILS',
        orderId: order.id,
        timestamp: nowIso
      });
      return jsonError('Incorrect code entered 5 times. Delivery verification is now LOCKED for 30 minutes. Contact store owner.', 'OTP_LOCKED', 423, cors);
    }

    const remaining = Math.max(0, 5 - attempts);
    return jsonError(`Incorrect delivery code. ${remaining} attempt(s) remaining.`, 'INVALID_OTP', 400, cors);
  }

  // OTP verified! Mark order delivered
  const updatePayload = {
    status: 'delivered',
    deliveredAt: nowIso,
    deliveredBy: user.uid,
    deliveredByName: user.email || user.name || 'Staff',
    otpVerified: true,
    updatedAt: nowIso
  };

  if (order.paymentMethod === 'cod') {
    updatePayload.paymentStatus = 'cod_collected';
    updatePayload.codCollected = Number(order.total) || 0;
    updatePayload.codCollectedAt = nowIso;
    updatePayload.codCollectedBy = user.email || 'staff';
  }

  await rtdbFetch(env, `orders/${orderPushKey}`, 'PATCH', updatePayload);

  await rtdbFetch(env, `audit/aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, 'PUT', {
    adminUid: user.uid,
    adminEmail: user.email || 'staff',
    action: 'DELIVERY_OTP_VERIFIED',
    orderId: order.id,
    timestamp: nowIso
  });

  return jsonResponse({
    success: true,
    orderId: order.id,
    status: 'delivered',
    otpVerified: true
  }, 200, cors);
}

/**
 * POST /api/admin/reissue-delivery-otp
 * - Store owner generates a fresh 4-digit code and resets attempts.
 */
async function handleAdminReissueDeliveryOtp(request, env, cors) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = await verifyFirebaseIdToken(token, env);
  if (!user || !(await isUserAdmin(user.uid, env))) {
    return jsonError('Unauthorized: Store Owner access required', 'FORBIDDEN', 403, cors);
  }

  const body = await request.json().catch(() => ({}));
  const { orderPushKey } = body;
  if (!orderPushKey) {
    return jsonError('orderPushKey is required', 'INVALID_PARAM', 400, cors);
  }

  const order = await rtdbFetch(env, `orders/${orderPushKey}`, 'GET');
  if (!order) {
    return jsonError('Order not found', 'NOT_FOUND', 404, cors);
  }

  const arr = new Uint16Array(1);
  crypto.getRandomValues(arr);
  const newCode = String(1000 + (arr[0] % 9000));

  await rtdbFetch(env, `orderPrivate/${orderPushKey}`, 'PUT', {
    code: newCode,
    customerUid: order.uid,
    attempts: 0,
    lockedUntil: 0,
    reissuedAt: Date.now()
  });

  await rtdbFetch(env, `orders/${orderPushKey}`, 'PATCH', {
    otpRequired: true,
    updatedAt: new Date().toISOString()
  });

  await rtdbFetch(env, `audit/aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, 'PUT', {
    adminUid: user.uid,
    adminEmail: user.email || 'admin',
    action: 'DELIVERY_OTP_REISSUED',
    orderId: order.id,
    timestamp: new Date().toISOString()
  });

  return jsonResponse({
    success: true,
    orderId: order.id,
    newCode: newCode
  }, 200, cors);
}

/**
 * POST /api/admin/deliver-without-otp
 * - Store owner override: marks delivered with mandatory explanation.
 */
async function handleAdminDeliverWithoutOtp(request, env, cors) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = await verifyFirebaseIdToken(token, env);
  if (!user || !(await isUserAdmin(user.uid, env))) {
    return jsonError('Unauthorized: Store Owner access required', 'FORBIDDEN', 403, cors);
  }

  const body = await request.json().catch(() => ({}));
  const { orderPushKey, reason } = body;
  if (!orderPushKey) {
    return jsonError('orderPushKey is required', 'INVALID_PARAM', 400, cors);
  }

  const cleanReason = String(reason || '').trim();
  if (cleanReason.length < 5) {
    return jsonError('An explanation / reason of at least 5 characters is required for override.', 'INVALID_REASON', 400, cors);
  }

  const order = await rtdbFetch(env, `orders/${orderPushKey}`, 'GET');
  if (!order) {
    return jsonError('Order not found', 'NOT_FOUND', 404, cors);
  }

  const nowIso = new Date().toISOString();
  const updatePayload = {
    status: 'delivered',
    deliveredAt: nowIso,
    deliveredBy: user.uid,
    deliveredByName: 'Store Owner (Override)',
    deliveredWithoutOtp: true,
    overrideReason: cleanReason,
    updatedAt: nowIso
  };

  if (order.paymentMethod === 'cod') {
    updatePayload.paymentStatus = 'cod_collected';
    updatePayload.codCollected = Number(order.total) || 0;
    updatePayload.codCollectedAt = nowIso;
    updatePayload.codCollectedBy = user.email || 'owner';
  }

  await rtdbFetch(env, `orders/${orderPushKey}`, 'PATCH', updatePayload);

  await rtdbFetch(env, `audit/aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, 'PUT', {
    adminUid: user.uid,
    adminEmail: user.email || 'admin',
    action: 'DELIVERY_OVERRIDE_WITHOUT_OTP',
    orderId: order.id,
    reason: cleanReason,
    timestamp: nowIso
  });

  return jsonResponse({
    success: true,
    orderId: order.id,
    status: 'delivered',
    deliveredWithoutOtp: true
  }, 200, cors);
}


/**
 * Scheduled Cron Task: Purges precise GPS coordinates 30 days after delivery (DPDP Act compliance)
 */
async function handlePurgeOldDeliveryGeo(env) {
  try {
    const orders = await rtdbFetch(env, 'orders', 'GET') || {};
    const cutoffMs = Date.now() - (30 * 24 * 3600 * 1000); // 30 days
    let purgedCount = 0;

    for (const [k, ord] of Object.entries(orders)) {
      if (!ord || ord.status !== 'delivered' || !ord.deliveredAt) continue;
      const deliveredMs = new Date(ord.deliveredAt).getTime();
      if (deliveredMs < cutoffMs) {
        if (ord.delivery && ord.delivery.geo) {
          await rtdbFetch(env, `orders/${k}/delivery/geo`, 'DELETE');
          if (ord.customer && ord.customer.geo) {
            await rtdbFetch(env, `orders/${k}/customer/geo`, 'DELETE');
          }
          purgedCount++;
        }
      }
    }
    if (purgedCount > 0) {
      console.log(`[DPDP Retention] Purged precise GPS from ${purgedCount} orders older than 30 days.`);
    }
  } catch (err) {
    console.warn('[DPDP Retention] Error purging old GPS coordinates:', err);
  }
}

/**
 * POST / GET /api/razorpay-callback
 * Handles in-app browser redirect flow when external UPI apps switch.
 */
async function handleRazorpayCallback(request, env, cors) {
  let razorpay_payment_id = '';
  let razorpay_order_id = '';
  let razorpay_signature = '';
  let errorCode = '';

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    try {
      const formData = await request.formData();
      razorpay_payment_id = formData.get('razorpay_payment_id') || '';
      razorpay_order_id = formData.get('razorpay_order_id') || '';
      razorpay_signature = formData.get('razorpay_signature') || '';
      errorCode = formData.get('error[code]') || formData.get('error_code') || '';
    } catch (_) {}
  } else if (request.method === 'POST') {
    try {
      const json = await request.json();
      razorpay_payment_id = json.razorpay_payment_id || '';
      razorpay_order_id = json.razorpay_order_id || '';
      razorpay_signature = json.razorpay_signature || '';
      errorCode = json.error?.code || '';
    } catch (_) {}
  } else {
    const url = new URL(request.url);
    razorpay_payment_id = url.searchParams.get('razorpay_payment_id') || '';
    razorpay_order_id = url.searchParams.get('razorpay_order_id') || '';
    razorpay_signature = url.searchParams.get('razorpay_signature') || '';
    errorCode = url.searchParams.get('error[code]') || '';
  }

  const clientBase = 'https://nikhil6281.github.io/K-Stores';

  if (errorCode || (!razorpay_payment_id && !razorpay_order_id)) {
    return Response.redirect(`${clientBase}/?payment_status=failed&reason=${encodeURIComponent(errorCode || 'cancelled')}`, 302);
  }

  // Signature check
  const msg = `${razorpay_order_id}|${razorpay_payment_id}`;
  const isValidSig = await verifyHmacSha256(env.RAZORPAY_KEY_SECRET, msg, razorpay_signature);

  // Locate order in RTDB
  const orders = await rtdbFetch(env, 'orders', 'GET') || {};
  let targetKey = null;
  let orderData = null;

  for (const [k, ord] of Object.entries(orders)) {
    if (ord.razorpayOrderId === razorpay_order_id) {
      targetKey = k;
      orderData = ord;
      break;
    }
  }

  if (!isValidSig) {
    if (targetKey) {
      await rtdbFetch(env, `orders/${targetKey}`, 'PATCH', {
        paymentStatus: 'failed',
        paymentMismatchNote: 'Callback signature mismatch',
        updatedAt: new Date().toISOString()
      });
    }
    return Response.redirect(`${clientBase}/?payment_status=invalid_signature`, 302);
  }

  const nowIso = new Date().toISOString();
  if (targetKey && orderData) {
    await rtdbFetch(env, `orders/${targetKey}`, 'PATCH', {
      status: 'placed',
      paymentStatus: 'paid',
      paidAt: nowIso,
      razorpayPaymentId: razorpay_payment_id,
      updatedAt: nowIso
    });
    return Response.redirect(`${clientBase}/?order_success=${encodeURIComponent(orderData.id || targetKey)}&paid=1`, 302);
  } else {
    await rtdbFetch(env, `paymentMismatches/${razorpay_payment_id}`, 'PUT', {
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      capturedAt: nowIso,
      status: 'callback_unmatched',
      resolved: false
    });
    return Response.redirect(`${clientBase}/?payment_status=pending_verification&payment_id=${encodeURIComponent(razorpay_payment_id)}`, 302);
  }
}

/**
 * POST /api/admin/refund-mismatch
 * Admin 1-tap instant refund for orphaned / mismatched payments.
 */
async function handleAdminRefundMismatch(request, env, cors) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearers+/i, '');
  const user = await verifyFirebaseIdToken(token, env);
  if (!user) {
    return jsonError('Unauthorized: valid Firebase login required', 'UNAUTHORIZED', 401, cors);
  }

  const admin = await isUserAdmin(user.uid, env);
  if (!admin) {
    return jsonError('Forbidden: owner/admin privilege required', 'FORBIDDEN', 403, cors);
  }

  const body = await request.json();
  const { paymentId, mismatchKey, reason = 'Owner refunded mismatch' } = body;

  if (!paymentId) {
    return jsonError('Payment ID is required', 'INVALID_PARAMS', 400, cors);
  }

  try {
    const refundRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': getRazorpayAuthHeader(env),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notes: { reason, refundedBy: user.email || user.uid }
      })
    });

    const refundData = await refundRes.json();
    if (refundData.error) {
      return jsonError(refundData.error.description || 'Razorpay refund failed', 'REFUND_FAILED', 400, cors);
    }

    const nowIso = new Date().toISOString();
    const targetKey = mismatchKey || paymentId;
    await rtdbFetch(env, `paymentMismatches/${targetKey}`, 'PATCH', {
      resolved: true,
      refundId: refundData.id,
      refundStatus: 'processed',
      refundedAt: nowIso,
      updatedAt: nowIso
    });

    return jsonResponse({
      success: true,
      refundId: refundData.id,
      paymentId: paymentId,
      message: 'Refund initiated successfully via Razorpay'
    }, 200, cors);
  } catch (err) {
    return jsonError(err.message || 'Refund error', 'SERVER_ERROR', 500, cors);
  }
}

/**
 * GET /api/catalog
 * Serves edge-cached catalog and settings with Cache-Control headers.
 */
async function handleGetCatalog(request, env, cors) {
  try {
    const [products, categories, settings] = await Promise.all([
      rtdbFetch(env, 'products', 'GET') || {},
      rtdbFetch(env, 'categories', 'GET') || {},
      rtdbFetch(env, 'settings', 'GET') || {}
    ]);

    const cleanCatalog = {};
    for (const [id, p] of Object.entries(products || {})) {
      if (!p || typeof p !== 'object') continue;
      cleanCatalog[id] = {
        id,
        name: p.name || '',
        nameTe: p.nameTe || '',
        price: Number(p.price) || 0,
        mrp: Number(p.mrp) || Number(p.price) || 0,
        unit: p.unit || '',
        category: p.category || '',
        inStock: p.inStock !== false,
        image: p.image || '',
        hasImage: p.hasImage === true,
        imageVersion: p.imageVersion || 1
      };
    }

    return new Response(JSON.stringify({
      version: Date.now(),
      products: cleanCatalog,
      categories: categories || {},
      settings: {
        deliveryFee: settings?.deliveryFee ?? 25,
        freeDeliveryThreshold: settings?.freeDeliveryThreshold ?? 299,
        minOrderValue: settings?.minOrderValue ?? 50,
        storeHours: settings?.storeHours || { mode: 'auto', open: '07:00', close: '21:00' }
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        ...cors
      }
    });
  } catch(err) {
    return jsonError(err.message || 'Failed to fetch catalog', 'CATALOG_ERROR', 500, cors);
  }
}


// ==========================================
// PUSH NOTIFICATIONS & MARKETING AUTOMATION (FCM HTTP v1)
// ==========================================

async function sendFcmMessageHttpV1(env, token, payload) {
  const accessToken = await getGoogleServiceAccessToken(env);
  if (!accessToken || !env.FIREBASE_PROJECT_ID) {
    throw new Error('FCM not configured: missing Google access token or project ID');
  }

  const url = `https://fcm.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/messages:send`;
  const body = {
    message: {
      token: token,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: {
        title: payload.title,
        body: payload.body,
        url: payload.url || './',
        orderId: payload.orderId ? String(payload.orderId) : '',
        offerId: payload.offerId ? String(payload.offerId) : '',
        tag: payload.tag || (payload.orderId ? `ra-order-${payload.orderId}` : 'ra-store-notif'),
        type: payload.type || 'order_update'
      },
      webpush: {
        fcm_options: {
          link: payload.url || './'
        },
        notification: {
          title: payload.title,
          body: payload.body,
          icon: './icon-192.png',
          badge: './icon-192.png',
          tag: payload.tag || (payload.orderId ? `ra-order-${payload.orderId}` : 'ra-store-notif'),
          renotify: true
        }
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  });

  return res;
}

function evaluateWorkerAntiAnnoyanceRules(customerUid, userRecord, customerOrders, nowMs = Date.now()) {
  const prefs = userRecord.notificationPreferences || {};
  if (prefs.offersAndReminders === false) {
    return { allowed: false, reason: 'opted_out' };
  }

  const tokens = userRecord.fcmTokens || {};
  if (Object.keys(tokens).length === 0) {
    return { allowed: false, reason: 'no_tokens' };
  }

  // Time check: 8:00 AM - 8:00 PM IST (UTC + 5.5 hours)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(nowMs + istOffsetMs);
  const istHour = istDate.getUTCHours();
  if (istHour < 8 || istHour >= 20) {
    return { allowed: false, reason: 'outside_hours_ist' };
  }

  const orders = Object.values(customerOrders || {});
  const hasActiveOrder = orders.some(o => 
    o.status === 'placed' || o.status === 'accepted' || o.status === 'packed' || o.status === 'out_for_delivery'
  );
  if (hasActiveOrder) {
    return { allowed: false, reason: 'has_active_order' };
  }

  const twentyFourHoursAgo = nowMs - (24 * 60 * 60 * 1000);
  const recentDelivery = orders.some(o => {
    if (o.status !== 'delivered') return false;
    const deliveredTime = new Date(o.updatedAt || o.deliveredAt || o.createdAt).getTime();
    return deliveredTime > twentyFourHoursAgo;
  });
  if (recentDelivery) {
    return { allowed: false, reason: 'post_delivery_cooldown' };
  }

  const history = Object.values(userRecord.offerHistory || {});
  const oneDayAgo = nowMs - (24 * 60 * 60 * 1000);
  const sevenDaysAgo = nowMs - (7 * 24 * 60 * 60 * 1000);

  const offersLastDay = history.filter(h => new Date(h.sentAt).getTime() > oneDayAgo).length;
  if (offersLastDay >= 1) {
    return { allowed: false, reason: 'daily_cap_reached' };
  }

  const offersLastWeek = history.filter(h => new Date(h.sentAt).getTime() > sevenDaysAgo).length;
  if (offersLastWeek >= 3) {
    return { allowed: false, reason: 'weekly_cap_reached' };
  }

  const sortedHistory = [...history].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  let consecutiveUnopened = 0;
  for (let h of sortedHistory) {
    if (!h.openedAt) {
      consecutiveUnopened++;
    } else {
      break;
    }
  }

  if (consecutiveUnopened >= 4) {
    const lastOfferTime = sortedHistory[0] ? new Date(sortedHistory[0].sentAt).getTime() : 0;
    const thirtyDaysAgo = nowMs - (30 * 24 * 60 * 60 * 1000);
    if (lastOfferTime > thirtyDaysAgo) {
      return { allowed: false, reason: 'unopened_streak_paused' };
    }
  }

  return { allowed: true };
}

async function handleAdminSendOffer(request, env, cors) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const verified = await verifyFirebaseIdToken(token, env);
  if (!verified) {
    return jsonError('Unauthorized: valid admin token required', 'UNAUTHORIZED', 401, cors);
  }

  const isAdmin = await isUserAdmin(verified.uid, env);
  if (!isAdmin) {
    return jsonError('Forbidden: owner account required', 'FORBIDDEN', 403, cors);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonError('Invalid JSON', 'INVALID_JSON', 400, cors);
  }

  const { title, message, categoryId, audience } = body;
  if (!title || !message) {
    return jsonError('Title and message are required', 'MISSING_FIELDS', 400, cors);
  }

  const [users, allOrders] = await Promise.all([
    rtdbFetch(env, 'users', 'GET'),
    rtdbFetch(env, 'orders', 'GET')
  ]);

  const ordersList = Object.values(allOrders || {});
  const now = Date.now();
  const fourteenDaysAgo = now - (14 * 24 * 3600 * 1000);

  let sentCount = 0;
  let skippedCount = 0;

  for (const [uid, userRecord] of Object.entries(users || {})) {
    const userOrders = ordersList.filter(o => o.uid === uid);
    const hasOrderLast14Days = userOrders.some(o => new Date(o.createdAt).getTime() > fourteenDaysAgo);

    if (audience === 'active14' && !hasOrderLast14Days) continue;
    if (audience === 'inactive14' && hasOrderLast14Days) continue;

    const check = evaluateWorkerAntiAnnoyanceRules(uid, userRecord, userOrders, now);
    if (!check.allowed) {
      skippedCount++;
      continue;
    }

    const offerId = `off_${now}_${Math.random().toString(36).substring(2, 6)}`;
    const targetUrl = categoryId ? `./?cat=${encodeURIComponent(categoryId)}&n=${offerId}` : `./?n=${offerId}`;

    const tokens = Object.values(userRecord.fcmTokens || {}).map(v => (typeof v === 'string' ? v : v.token)).filter(Boolean);
    let userSent = false;

    for (const fcmToken of tokens) {
      try {
        const res = await sendFcmMessageHttpV1(env, fcmToken, {
          title: title,
          body: message,
          url: targetUrl,
          offerId: offerId,
          tag: 'ra-offer-broadcast',
          type: 'sales_offer'
        });
        if (res.ok) userSent = true;
      } catch (err) {
        console.warn('FCM send error:', err);
      }
    }

    if (userSent) {
      sentCount++;
      const nowIso = new Date().toISOString();
      await rtdbFetch(env, `users/${uid}/offerHistory/${offerId}`, 'PUT', {
        offerId,
        type: 'owner_broadcast',
        title,
        sentAt: nowIso
      });
      await rtdbFetch(env, `audit/offerLogs/${offerId}`, 'PUT', {
        offerId,
        customerUid: uid,
        type: 'owner_broadcast',
        title,
        sentAt: nowIso
      });
    } else {
      skippedCount++;
    }
  }

  return jsonResponse({ success: true, sentCount, skippedCount }, 200, cors);
}

async function handleRecordOfferOpen(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonError('Invalid JSON', 'INVALID_JSON', 400, cors);
  }

  const { uid, offerId } = body;
  if (!uid || !offerId) {
    return jsonError('uid and offerId required', 'MISSING_FIELDS', 400, cors);
  }

  await rtdbFetch(env, `users/${uid}/offerHistory/${offerId}/openedAt`, 'PUT', new Date().toISOString());
  return jsonResponse({ success: true }, 200, cors);
}

async function handleScheduledOffers(env) {
  try {
    const settings = await rtdbFetch(env, 'settings', 'GET');
    if (settings && settings.automaticOffersEnabled === false) {
      return; // Disabled by owner
    }

    const now = Date.now();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now + istOffsetMs);
    const istHour = istDate.getUTCHours();
    if (istHour < 8 || istHour >= 20) {
      return; // Outside 8 AM - 8 PM IST
    }

    // Check queued broadcasts in RTDB
    const broadcasts = await rtdbFetch(env, 'offerBroadcasts', 'GET');
    if (broadcasts) {
      for (const [bId, b] of Object.entries(broadcasts)) {
        if (b.status === 'queued') {
          await rtdbFetch(env, `offerBroadcasts/${bId}/status`, 'PUT', 'processing');
          // Mark as processed
          await rtdbFetch(env, `offerBroadcasts/${bId}/status`, 'PUT', 'completed');
        }
      }
    }
  } catch (e) {
    console.warn('Scheduled offers error:', e);
  }
}


// ==========================================
// ORDER STATUS NOTIFICATIONS (Bilingual EN/TE)
// ==========================================

async function sendOrderStatusNotification(env, order, newStatus) {
  if (!order || !order.uid || !newStatus) return;
  try {
    const user = await rtdbFetch(env, `users/${order.uid}`, 'GET');
    if (!user) return;

    // Check user preference
    const prefs = user.notificationPreferences || {};
    if (prefs.orderUpdates === false) return; // User opted out of order updates

    const tokens = Object.values(user.fcmTokens || {}).map(v => (typeof v === 'string' ? v : v.token)).filter(Boolean);
    if (!tokens.length) return;

    // Detect user lang (default 'te')
    const lang = (user.profile && user.profile.lang) || 'te';
    const orderId = order.id || order.orderId || 'Order';

    const msgs = {
      en: {
        placedTitle: 'Order placed ✅',
        placedBody: `We've received order #${orderId} (₹${order.total || ''}).`,
        acceptedTitle: 'Order confirmed 👍',
        acceptedBody: `RA Store accepted order #${orderId}. Packing starts soon.`,
        packedTitle: 'Order packed 📦',
        packedBody: `Order #${orderId} is packed and ready for the rider.`,
        out_for_deliveryTitle: 'On the way 🛵',
        out_for_deliveryBody: `Order #${orderId} is out for delivery. Keep your 4-digit delivery code ready.`,
        deliveredTitle: 'Delivered ✅',
        deliveredBody: `Order #${orderId} delivered. Thank you for shopping with RA Store!`,
        cancelledTitle: 'Order cancelled',
        cancelledBody: `Order #${orderId} was cancelled.`
      },
      te: {
        placedTitle: 'ఆర్డర్ పూర్తయింది ✅',
        placedBody: `మేము మీ ఆర్డర్ #${orderId} (₹${order.total || ''}) ను స్వీకరించాము.`,
        acceptedTitle: 'ఆర్డర్ నిర్ధారించబడింది 👍',
        acceptedBody: `RA స్టోర్ ఆర్డర్ #${orderId} ను అంగీకరించింది. త్వరలో ప్యాకింగ్ ప్రారంభమవుతుంది.`,
        packedTitle: 'ఆర్డర్ ప్యాక్ చేయబడింది 📦',
        packedBody: `ఆర్డర్ #${orderId} ప్యాక్ చేయబడింది మరియు రైడర్ కోసం సిద్ధంగా ఉంది.`,
        out_for_deliveryTitle: 'డెలివరీ బయలుదేరింది 🛵',
        out_for_deliveryBody: `ఆర్డర్ #${orderId} డెలివరీ కోసం బయలుదేరింది. మీ 4 అంకెల డెలివరీ కోడ్ సిద్ధంగా ఉంచుకోండి.`,
        deliveredTitle: 'డెలివరీ చేయబడింది ✅',
        deliveredBody: `ఆర్డర్ #${orderId} విజయవంతంగా డెలివరీ చేయబడింది. RA స్టోర్‌లో కొనుగోలు చేసినందుకు ధన్యవాదాలు!`,
        cancelledTitle: 'ఆర్డర్ రద్దు చేయబడింది',
        cancelledBody: `ఆర్డర్ #${orderId} రద్దు చేయబడింది.`
      }
    };

    const dict = msgs[lang] || msgs['te'];
    const title = dict[`${newStatus}Title`] || `Order Update: #${orderId}`;
    const body = dict[`${newStatus}Body`] || `Order #${orderId} status is now ${newStatus}`;

    const targetUrl = `./?order=${encodeURIComponent(orderId)}#orders`;

    for (const fcmToken of tokens) {
      try {
        await sendFcmMessageHttpV1(env, fcmToken, {
          title: title,
          body: body,
          url: targetUrl,
          orderId: orderId,
          tag: `sri-sai-order-${orderId}`,
          type: 'order_status_update'
        });
      } catch (err) {
        console.warn('[FCM] Push token send error:', err);
      }
    }
  } catch (e) {
    console.warn('[FCM] sendOrderStatusNotification error:', e);
  }
}

async function handleNotifyOrderStatus(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonError('Invalid JSON', 'INVALID_JSON', 400, cors);
  }

  const { orderId, status } = body;
  if (!orderId || !status) {
    return jsonError('orderId and status required', 'MISSING_FIELDS', 400, cors);
  }

  let order = await rtdbFetch(env, `orders/${orderId}`, 'GET');
  if (!order) {
    const allOrders = await rtdbFetch(env, 'orders', 'GET');
    if (allOrders) {
      const matchKey = Object.keys(allOrders).find(k => k === orderId || allOrders[k].id === orderId);
      if (matchKey) order = allOrders[matchKey];
    }
  }

  if (!order) {
    return jsonError('Order not found', 'NOT_FOUND', 404, cors);
  }

  await sendOrderStatusNotification(env, order, status);
  return jsonResponse({ success: true, orderId: order.id || orderId, status }, 200, cors);
}

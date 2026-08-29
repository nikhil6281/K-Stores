require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors({
  origin: true, // Allow all origins for development; restrict in production
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));

// --- Razorpay Instance ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// --- Order Storage (JSON file for persistence across restarts) ---
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.error('Error reading orders file:', err.message);
  }
  return [];
}

function writeOrders(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing orders file:', err.message);
  }
}

// ==========================================================================
// ORDER SYNC ENDPOINTS (Cross-Device)
// ==========================================================================

/**
 * GET /api/orders
 * Returns all orders, sorted newest first
 */
app.get('/api/orders', (req, res) => {
  const orders = readOrders();
  orders.sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });
  res.json({ success: true, orders });
});

/**
 * POST /api/orders
 * Add a new order. Body: full order object
 */
app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder || !newOrder.id) {
    return res.status(400).json({ success: false, error: 'Order object with id is required' });
  }

  const orders = readOrders();

  // Prevent duplicates
  const existingIdx = orders.findIndex(o => o.id === newOrder.id);
  if (existingIdx >= 0) {
    orders[existingIdx] = newOrder; // Update existing
  } else {
    orders.unshift(newOrder); // Add new at top
  }

  writeOrders(orders);
  console.log(`[ORDER] New order ${newOrder.id} from ${newOrder.customerName} — ₹${newOrder.totalAmount}`);
  res.json({ success: true, orders });
});

/**
 * PATCH /api/orders/:id/status
 * Update a single order's status. Body: { status: 'packing' | 'out_for_delivery' | 'delivered' | ... }
 */
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: 'status field is required' });
  }

  const orders = readOrders();
  const orderIdx = orders.findIndex(o => o.id === id);

  if (orderIdx < 0) {
    return res.status(404).json({ success: false, error: `Order ${id} not found` });
  }

  orders[orderIdx].status = status;
  orders[orderIdx].updatedAt = new Date().toISOString();

  // If Razorpay payment was made and order delivered, log it
  if (status === 'delivered' && orders[orderIdx].razorpayPaymentId) {
    console.log(`[PAYMENT] Order ${id} delivered. Razorpay payment: ${orders[orderIdx].razorpayPaymentId}`);
  }

  writeOrders(orders);
  console.log(`[STATUS] Order ${id} updated to: ${status}`);
  res.json({ success: true, order: orders[orderIdx] });
});

/**
 * PUT /api/orders/bulk
 * Replace entire orders array (used for initial sync from client-side localStorage)
 */
app.put('/api/orders/bulk', (req, res) => {
  const { orders } = req.body;
  if (!Array.isArray(orders)) {
    return res.status(400).json({ success: false, error: 'orders array is required' });
  }

  // Merge: keep server orders, add any new client orders
  const serverOrders = readOrders();
  const serverMap = new Map(serverOrders.map(o => [o.id, o]));

  orders.forEach(o => {
    if (o && o.id && !serverMap.has(o.id)) {
      serverMap.set(o.id, o);
    }
  });

  const merged = Array.from(serverMap.values()).sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  writeOrders(merged);
  res.json({ success: true, orders: merged });
});


// ==========================================================================
// RAZORPAY ENDPOINTS
// ==========================================================================

/**
 * POST /api/create-order
 * Create a Razorpay order
 * Body: { amount (in rupees), receipt (optional) }
 */
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, receipt, currency } = req.body;

    // Validate amount (minimum ₹1 = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);
    if (!amountInPaise || amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least ₹1 (100 paise)'
      });
    }

    const options = {
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: receipt || `kstores_rcpt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);
    console.log(`[RAZORPAY] Order created: ${razorpayOrder.id} for ₹${amount}`);

    res.json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID // Safe to send key_id (not key_secret)
    });
  } catch (err) {
    console.error('[RAZORPAY] Create order error:', err.message);

    if (err.statusCode === 401) {
      return res.status(401).json({ success: false, error: 'Razorpay authentication failed. Check API keys.' });
    }

    res.status(500).json({
      success: false,
      error: err.error?.description || err.message || 'Failed to create Razorpay order'
    });
  }
});

/**
 * POST /api/verify-payment
 * Verify Razorpay payment signature
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature'
      });
    }

    // Generate expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      console.log(`[RAZORPAY] ✅ Payment verified: ${razorpay_payment_id}`);
      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id
      });
    } else {
      console.warn(`[RAZORPAY] ❌ Signature mismatch for payment: ${razorpay_payment_id}`);
      res.status(400).json({
        success: false,
        error: 'Payment signature verification failed. Payment NOT confirmed.'
      });
    }
  } catch (err) {
    console.error('[RAZORPAY] Verify error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Internal error during payment verification'
    });
  }
});


// ==========================================================================
// HEALTH CHECK
// ==========================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'K-Stores Backend',
    razorpay_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    orders_count: readOrders().length,
    timestamp: new Date().toISOString()
  });
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║   🏪 K-Stores Backend Server Running        ║');
  console.log(`  ║   🌐 http://localhost:${PORT}                  ║`);
  console.log('  ║   💳 Razorpay Payments: READY                ║');
  console.log('  ║   📦 Order Sync: READY                       ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Razorpay Key: ${process.env.RAZORPAY_KEY_ID ? '✅ Configured' : '❌ Missing'}`);
  console.log(`  Orders file: ${ORDERS_FILE}`);
  console.log('');
});

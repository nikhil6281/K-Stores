const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TWgfmbYBnc7AU9';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '9bNyxZV8SWTuh4wtSPeAUOhJ';

const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

/**
 * STEP 1: BACKEND - Create Order
 * POST /api/create-order
 */
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Minimum amount validation: 100 paise (₹1.00)
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 100 paise (₹1.00).'
      });
    }

    const options = {
      amount: Math.round(amount),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: KEY_ID
    });
  } catch (error) {
    console.error('[Razorpay Backend] Order creation error:', error);
    return res.status(500).json({
      success: false,
      error: error.error ? error.error.description : 'Failed to create Razorpay order'
    });
  }
});

/**
 * STEP 3: BACKEND - Verify Payment Signature
 * POST /api/verify-payment
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required signature verification fields'
      });
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: 'Payment signature verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Payment verification failed.'
      });
    }
  } catch (error) {
    console.error('[Razorpay Backend] Signature verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error verifying payment signature'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Razorpay backend server listening on http://localhost:${PORT}`);
});

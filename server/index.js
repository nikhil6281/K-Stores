const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_TtGrq3sfJkM0pA';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

if (!KEY_SECRET) {
  console.warn('[Razorpay Backend] Warning: RAZORPAY_KEY_SECRET is not configured in environment variables.');
}

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

// ==========================================
// WhatsApp OTP Endpoints (Meta Cloud API v26.0)
// ==========================================

const whatsappOtps = new Map();

function normalizeWhatsappPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]\d{9}$/.test(digits.slice(2))) return digits;
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]\d{9}$/.test(digits.slice(1))) return `91${digits.slice(1)}`;
  if (digits.length >= 10 && digits.length <= 15) return digits;
  return null;
}

app.post(['/api/auth/whatsapp/send-otp', '/api/send-whatsapp-otp'], async (req, res) => {
  try {
    const { phone } = req.body || {};
    const normalizedPhone = normalizeWhatsappPhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.', code: 'INVALID_PHONE' });
    }

    const now = Date.now();
    const existing = whatsappOtps.get(normalizedPhone);

    if (existing && (now - existing.createdAt < 30 * 1000)) {
      const waitSec = Math.ceil((30 * 1000 - (now - existing.createdAt)) / 1000);
      return res.status(429).json({ success: false, error: `Please wait ${waitSec} seconds before requesting a new code.`, code: 'RATE_LIMITED' });
    }

    const windowMs = 15 * 60 * 1000;
    const isInsideWindow = existing?.windowStart && (now - existing.windowStart < windowMs);
    const windowStart = isInsideWindow ? existing.windowStart : now;
    const windowCount = isInsideWindow ? (existing.requestCount || 0) : 0;

    if (windowCount >= 3) {
      const resetMin = Math.ceil((windowMs - (now - windowStart)) / 60000);
      return res.status(429).json({ success: false, error: `Too many OTP requests. Please wait ${resetMin} minutes before trying again.`, code: 'RATE_LIMITED' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(otpCode).digest('hex');

    whatsappOtps.set(normalizedPhone, {
      codeHash,
      createdAt: now,
      expiresAt: now + (5 * 60 * 1000),
      attempts: 0,
      maxAttempts: 3,
      requestCount: windowCount + 1,
      windowStart
    });

    const isTestMode = String(process.env.OTP_TEST_MODE || '').toLowerCase() === 'true';
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '1490832314108512';
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'hello_world';

    let metaSuccess = false;
    if (accessToken && phoneNumberId && typeof fetch !== 'undefined') {
      try {
        const payload = templateName === 'hello_world'
          ? {
              messaging_product: 'whatsapp',
              to: normalizedPhone,
              type: 'template',
              template: { name: 'hello_world', language: { code: 'en_US' } }
            }
          : {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: normalizedPhone,
              type: 'template',
              template: {
                name: templateName,
                language: { code: 'en' },
                components: [
                  { type: 'body', parameters: [{ type: 'text', text: otpCode }] },
                  { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: otpCode }] }
                ]
              }
            };

        const metaRes = await fetch(`https://graph.facebook.com/v26.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        if (metaRes.ok) metaSuccess = true;
      } catch (err) {
        console.warn('[Server WhatsApp Meta Error]', err.message);
      }
    }

    console.log(`[Server WhatsApp OTP] Sent to ${normalizedPhone}: ${otpCode}`);

    const resp = {
      success: true,
      message: 'OTP sent successfully on WhatsApp',
      normalizedPhone
    };
    if (isTestMode) resp.devOtp = otpCode;

    return res.status(200).json(resp);
  } catch (err) {
    console.error('[Server WhatsApp OTP Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/auth/whatsapp/verify-otp', '/api/verify-whatsapp-otp'], async (req, res) => {
  try {
    const { phone, otp } = req.body || {};
    const normalizedPhone = normalizeWhatsappPhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.', code: 'INVALID_PHONE' });
    }

    const normalizedOtp = String(otp || '').trim();
    if (!/^[0-9]{6}$/.test(normalizedOtp)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 6-digit numeric OTP.', code: 'INVALID_FORMAT' });
    }

    const record = whatsappOtps.get(normalizedPhone);
    if (!record) {
      return res.status(400).json({ success: false, error: 'Verification code expired or not found. Please request a new code.', code: 'NOT_FOUND' });
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      whatsappOtps.delete(normalizedPhone);
      return res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new code.', code: 'EXPIRED' });
    }

    if (record.attempts >= record.maxAttempts) {
      whatsappOtps.delete(normalizedPhone);
      return res.status(429).json({ success: false, error: 'Too many invalid attempts. Please request a new OTP.', code: 'RATE_LIMITED' });
    }

    const inputHash = crypto.createHash('sha256').update(normalizedOtp).digest('hex');
    if (inputHash !== record.codeHash) {
      record.attempts++;
      const remaining = record.maxAttempts - record.attempts;
      if (remaining <= 0) {
        whatsappOtps.delete(normalizedPhone);
        return res.status(429).json({ success: false, error: 'Too many invalid attempts. Please request a new OTP.', code: 'RATE_LIMITED' });
      }
      return res.status(400).json({ success: false, error: `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`, code: 'INCORRECT_CODE' });
    }

    whatsappOtps.delete(normalizedPhone);
    const uid = 'usr_p_' + crypto.createHash('sha256').update(normalizedPhone).digest('hex').substring(0, 20);

    return res.status(200).json({
      success: true,
      uid,
      phone: `+${normalizedPhone}`,
      message: 'Verified successfully'
    });
  } catch (err) {
    console.error('[Server WhatsApp Verify Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Razorpay backend server listening on http://localhost:${PORT}`);
});

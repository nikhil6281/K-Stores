/**
 * Cloud Functions for Sri Sai (Anantapur, Andhra Pradesh)
 * Region: asia-south1 (Mumbai) / default
 * Realtime Database triggers for Push Notifications & Scheduled Marketing Automation
 * Server-side Email OTP Authentication & Token Issuance
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.database();

// ============================================================================
// I18N MESSAGES (ALL IN ENGLISH AS PER REQUIREMENT 5)
// ============================================================================

const NOTIF_MESSAGES = {
  placedTitle: 'Order Placed ✅',
  placedBody: (id, total, slot) => `Order #${id} Placed (₹${total}).${slot ? ` Scheduled: ${slot}.` : ''}`,
  acceptedTitle: 'Order Accepted 👍',
  acceptedBody: (id) => `Order #${id} Accepted. Packing starts soon at Sri Sai.`,
  packedTitle: 'Order Packed 📦',
  packedBody: (id) => `Order #${id} Packed and ready for the rider.`,
  outForDeliveryTitle: 'Order Out for Delivery 🛵',
  outForDeliveryBody: (id) => `Order #${id} Out for Delivery. Rider will ask for your 4-digit code.`,
  deliveredTitle: 'Order Delivered ✅',
  deliveredBody: (id) => `Order #${id} Delivered. Thank you for shopping with Sri Sai!`,
  cancelledTitle: 'Order Cancelled ❌',
  cancelledBody: (id, isPaid) => `Order #${id} Cancelled.${isPaid ? ' Refund reaches your original payment method in 5-7 working days.' : ''}`,
  
  // Marketing offers (All in English)
  reorderReminderTitle: 'Running low? 🛒',
  reorderReminderBody: 'Reorder your last grocery items from Sri Sai in one tap.',
  backInStockTitle: 'Back in Stock! 🥦',
  backInStockBody: (name) => `${name} is back in stock at Sri Sai! Order now for fresh delivery.`,
  priceDropTitle: 'Price Drop Alert! 🏷️',
  priceDropBody: (name, price) => `Price dropped on ${name}! Now only ₹${price} at Sri Sai.`,
  winBackTitle: 'We miss you at Sri Sai! 🛍️',
  winBackBody: 'Enjoy fast doorstep grocery delivery in Anantapur. Tap to browse fresh items.'
};

// ============================================================================
// HELPER: SEND PUSH NOTIFICATION VIA FCM (ALL IN ENGLISH)
// ============================================================================

async function sendFcmToUser(uid, payload, options = {}) {
  try {
    const tokensSnap = await db.ref(`users/${uid}/fcmTokens`).once('value');
    const tokensObj = tokensSnap.val();
    if (!tokensObj) return { sentCount: 0, removedCount: 0 };

    const tokenEntries = Object.entries(tokensObj);
    const tokens = tokenEntries.map(([k, v]) => (typeof v === 'string' ? v : v.token)).filter(Boolean);
    if (!tokens.length) return { sentCount: 0, removedCount: 0 };

    const message = {
      tokens: tokens,
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
        tag: options.tag || (payload.orderId ? `sri-sai-order-${payload.orderId}` : 'sri-sai-notif'),
        type: payload.type || 'order_update'
      },
      webpush: {
        fcmOptions: {
          link: payload.url || './'
        },
        notification: {
          title: payload.title,
          body: payload.body,
          icon: './assets/logo/app-icon-192.png?v=2',
          badge: './assets/logo/badge-96.png?v=2',
          tag: options.tag || (payload.orderId ? `sri-sai-order-${payload.orderId}` : 'sri-sai-notif'),
          renotify: true,
          requireInteraction: false
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    let removedCount = 0;

    // Prune invalid or expired tokens automatically
    const badTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error) {
        const code = resp.error.code;
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          badTokens.push(tokenEntries[idx][0]);
        }
      }
    });

    if (badTokens.length > 0) {
      const updates = {};
      badTokens.forEach(k => {
        updates[`users/${uid}/fcmTokens/${k}`] = null;
      });
      await db.ref().update(updates);
      removedCount = badTokens.length;
    }

    return { sentCount: response.successCount, removedCount };
  } catch (err) {
    console.error(`[FCM] Error sending to user ${uid}:`, err);
    return { error: err.message };
  }
}

// ============================================================================
// ORDER STATUS CHANGE TRIGGER
// ============================================================================

exports.onOrderStatusChanged = functions.database.ref('/orders/{orderKey}')
  .onWrite(async (change, context) => {
    const orderKey = context.params.orderKey;
    if (!change.after.exists()) return null; // Order deleted

    const before = change.before.exists() ? change.before.val() : {};
    const after = change.after.val();

    const oldStatus = before.status;
    const newStatus = after.status || 'placed';
    const oldPayStatus = before.paymentStatus;
    const newPayStatus = after.paymentStatus;

    const statusChanged = oldStatus !== newStatus;
    const paymentConfirmed = (after.paymentMethod === 'online_razorpay' && oldPayStatus !== 'paid' && newPayStatus === 'paid');
    
    if (!statusChanged && !paymentConfirmed) {
      return null;
    }

    if (newStatus === 'placed' && after.paymentMethod === 'online_razorpay' && newPayStatus !== 'paid') {
      return null; // Awaiting online payment confirmation
    }

    if (after.lastNotifiedStatus === newStatus && !paymentConfirmed) {
      return null;
    }

    const customerUid = after.uid;
    if (!customerUid) return null;

    const prefsSnap = await db.ref(`users/${customerUid}/notificationPreferences`).once('value');
    const prefs = prefsSnap.val() || {};
    if (prefs.orderUpdates === false) {
      return null;
    }

    // All notifications in English as per Requirement 5
    const t = NOTIF_MESSAGES;
    const orderId = after.id || orderKey;
    const total = after.total || 0;
    const scheduledSlot = (after.customer && after.customer.scheduledSlot) || after.scheduledSlot || '';
    const isPaidOnline = (after.paymentMethod === 'online_razorpay' && (newPayStatus === 'paid' || newPayStatus === 'refund_initiated' || newPayStatus === 'refunded'));

    let title = '';
    let body = '';

    switch (newStatus) {
      case 'placed':
        title = t.placedTitle;
        body = t.placedBody(orderId, total, scheduledSlot);
        break;
      case 'accepted':
        title = t.acceptedTitle;
        body = t.acceptedBody(orderId);
        break;
      case 'packed':
        title = t.packedTitle;
        body = t.packedBody(orderId);
        break;
      case 'out_for_delivery':
        title = t.outForDeliveryTitle;
        body = t.outForDeliveryBody(orderId);
        break;
      case 'delivered':
        title = t.deliveredTitle;
        body = t.deliveredBody(orderId);
        break;
      case 'cancelled':
        title = t.cancelledTitle;
        body = t.cancelledBody(orderId, isPaidOnline);
        break;
      default:
        return null;
    }

    const payload = {
      title,
      body,
      orderId,
      url: `./?order=${encodeURIComponent(orderId)}#orders`,
      type: 'order_status'
    };

    const result = await sendFcmToUser(customerUid, payload, { tag: `sri-sai-order-${orderId}` });

    await db.ref(`orders/${orderKey}`).update({
      lastNotifiedStatus: newStatus,
      lastNotifiedAt: new Date().toISOString()
    });

    return result;
  });

// ============================================================================
// AUTOMATED MARKETING OFFERS (SCHEDULED: 8:00 AM - 8:00 PM IST)
// ============================================================================

function isWithinMarketingHoursIST() {
  const nowUtc = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const nowIst = new Date(nowUtc.getTime() + istOffsetMs);
  const istHour = nowIst.getUTCHours();
  if (istHour < 8 || istHour >= 20) {
    return false;
  }
  return true;
}

async function sendOfferIfEligible(uid, offerPayload, userRecord, userOrders) {
  const prefs = (userRecord && userRecord.notificationPreferences) || {};
  if (prefs.marketingOffers === false) {
    return { sent: false, reason: 'user_opted_out' };
  }

  const now = Date.now();
  const lastSent = prefs.lastOfferSentAt || 0;

  // Anti-annoyance rules engine (max 1/day, max 3/week, no active orders, no delivery within 24h, 4 unopened pause)
  const offersLastDay = (userRecord && userRecord.offerHistory ? Object.values(userRecord.offerHistory).filter(h => now - new Date(h.sentAt).getTime() < 24 * 60 * 60 * 1000).length : (now - lastSent < 24 * 60 * 60 * 1000 ? 1 : 0));
  if (offersLastDay >= 1) {
    return { sent: false, reason: 'max_1_per_day' };
  }
  const offersLastWeek = userRecord && userRecord.offerHistory ? Object.values(userRecord.offerHistory).filter(h => now - new Date(h.sentAt).getTime() < 7 * 24 * 60 * 60 * 1000).length : 0;
  if (offersLastWeek >= 3) {
    return { sent: false, reason: 'max_3_per_week' };
  }
  const hasActiveOrder = userOrders.some(o => ['placed', 'accepted', 'packed', 'out_for_delivery'].includes(o.status));
  if (hasActiveOrder) {
    return { sent: false, reason: 'has_active_order' };
  }
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
  const recentDelivered = userOrders.some(o => o.status === 'delivered' && new Date(o.createdAt).getTime() > twentyFourHoursAgo);
  if (recentDelivered) {
    return { sent: false, reason: 'delivered_within_24h' };
  }
  const consecutiveUnopened = prefs.consecutiveUnopenedOffers || 0;
  if (consecutiveUnopened >= 4) {
    return { sent: false, reason: 'paused_unopened' };
  }

  const result = await sendFcmToUser(uid, offerPayload, { tag: `sri-sai-offer-${offerPayload.type}` });
  if (result && result.sentCount > 0) {
    await db.ref(`users/${uid}/notificationPreferences`).update({
      lastOfferSentAt: now
    });
    await db.ref(`users/${uid}/offerHistory`).push({
      type: offerPayload.type,
      title: offerPayload.title,
      body: offerPayload.body,
      sentAt: new Date().toISOString()
    });
    return { sent: true };
  }

  return { sent: false, reason: 'no_tokens_or_failed' };
}

exports.hourlyOffersJob = functions.pubsub.schedule('every 1 hours')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    if (!isWithinMarketingHoursIST()) {
      return null;
    }

    const settingsSnap = await db.ref('settings/marketingAutomationsEnabled').once('value');
    if (settingsSnap.val() === false) {
      return null;
    }

    const [usersSnap, ordersSnap, productsSnap] = await Promise.all([
      db.ref('users').once('value'),
      db.ref('orders').once('value'),
      db.ref('products').once('value')
    ]);

    const users = usersSnap.val() || {};
    const allOrders = Object.values(ordersSnap.val() || {});
    const products = productsSnap.val() || {};
    const now = Date.now();
    const t = NOTIF_MESSAGES;

    for (const [uid, userRecord] of Object.entries(users)) {
      const userOrders = allOrders.filter(o => o.uid === uid);
      if (!userOrders.length) continue;

      userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const lastOrder = userOrders[0];
      const lastOrderTime = new Date(lastOrder.createdAt).getTime() || 0;
      const daysSinceLastOrder = (now - lastOrderTime) / (1000 * 60 * 60 * 24);

      // Trigger 1: 5-Day Reorder Reminder
      if (daysSinceLastOrder >= 5 && daysSinceLastOrder < 6 && lastOrder.status === 'delivered') {
        await sendOfferIfEligible(uid, {
          type: 'reorder_reminder',
          title: t.reorderReminderTitle,
          body: t.reorderReminderBody,
          url: './#orders'
        }, userRecord, userOrders);
        continue;
      }

      // Trigger 2: 21-Day Win-Back Offer
      if (daysSinceLastOrder >= 21 && daysSinceLastOrder < 22) {
        await sendOfferIfEligible(uid, {
          type: 'win_back_21d',
          title: t.winBackTitle,
          body: t.winBackBody,
          url: './'
        }, userRecord, userOrders);
        continue;
      }

      // Trigger 3: Back-in-Stock Alert
      if (lastOrder.items && Array.isArray(lastOrder.items)) {
        for (const item of lastOrder.items) {
          const prod = products[item.productId || item.id];
          if (prod && prod.inStock === true && prod.stockUpdatedAt) {
            const stockUpdatedTime = new Date(prod.stockUpdatedAt).getTime();
            if (stockUpdatedTime > lastOrderTime && (now - stockUpdatedTime) < 24 * 60 * 60 * 1000) {
              await sendOfferIfEligible(uid, {
                type: 'back_in_stock',
                title: t.backInStockTitle,
                body: t.backInStockBody(prod.name),
                url: `./?cat=${encodeURIComponent(prod.category || '')}`
              }, userRecord, userOrders);
              break;
            }
          }
        }
      }
    }

    return null;
  });

// ============================================================================
// OWNER BROADCAST OFFER (admin.html -> Settings)
// ============================================================================

exports.sendBroadcastOffer = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Admin authentication required.');
  }

  const adminSnap = await db.ref(`admins/${context.auth.uid}`).once('value');
  if (adminSnap.val() !== true) {
    throw new functions.https.HttpsError('permission-denied', 'Only owner account can broadcast offers.');
  }

  const { title, message, categoryId, audience } = data;
  if (!title || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Title and message are required.');
  }

  const [usersSnap, ordersSnap] = await Promise.all([
    db.ref('users').once('value'),
    db.ref('orders').once('value')
  ]);

  const users = usersSnap.val() || {};
  const allOrders = Object.values(ordersSnap.val() || {});
  const now = Date.now();
  const fourteenDaysAgo = now - (14 * 24 * 3600 * 1000);

  let sentCount = 0;
  let skippedCount = 0;

  for (const [uid, userRecord] of Object.entries(users)) {
    const userOrders = allOrders.filter(o => o.uid === uid);
    const hasOrderLast14Days = userOrders.some(o => new Date(o.createdAt).getTime() > fourteenDaysAgo);

    if (audience === 'active14' && !hasOrderLast14Days) continue;
    if (audience === 'inactive14' && hasOrderLast14Days) continue;

    const offerUrl = categoryId ? `./?cat=${encodeURIComponent(categoryId)}` : './';
    const result = await sendOfferIfEligible(uid, {
      type: 'owner_broadcast',
      title: title,
      body: message,
      url: offerUrl
    }, userRecord, userOrders);

    if (result.sent) {
      sentCount++;
    } else {
      skippedCount++;
    }
  }

  return { success: true, sentCount, skippedCount };
});

// ============================================================================
// ITEM 6: SECURE SERVER-SIDE EMAIL OTP AUTHENTICATION
// ============================================================================

function hashEmailKey(email) {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex').substring(0, 32);
}

function hashOtpCode(code, salt) {
  return crypto.createHmac('sha256', salt || 'sri-sai-salt-2026').update(String(code).trim()).digest('hex');
}

async function sendTransactionalEmail(toEmail, code) {
  const subject = `Your Sri Sai Login Code: ${code}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #15803d; margin: 0 0 6px 0; font-size: 24px; font-weight: 800;">Sri Sai</h2>
        <p style="color: #6b7280; margin: 0; font-size: 13px;">Daily Fresh Grocery Delivery in Anantapur</p>
      </div>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
        <p style="color: #166534; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">Your 6-Digit Verification Code</p>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #15803d; font-family: monospace;">${code}</div>
      </div>
      <p style="color: #4b5563; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">This code is valid for <strong>10 minutes</strong> and can only be used once. Do not share this code with anyone.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0; text-align: center;">Sri Sai • Old Town, Anantapur, Andhra Pradesh - 515001<br>If you did not request this code, you can safely ignore this email.</p>
    </div>
  `;
  const text = `Your Sri Sai login code is: ${code}\nValid for 10 minutes. Do not share this code with anyone.\n\nSri Sai • Old Town, Anantapur, Andhra Pradesh`;

  const resendApiKey = process.env.RESEND_API_KEY || (functions.config().resend && functions.config().resend.key);
  const sendgridApiKey = process.env.SENDGRID_API_KEY || (functions.config().sendgrid && functions.config().sendgrid.key);

  if (resendApiKey) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Sri Sai <auth@srisai.in>',
          to: [toEmail],
          subject: subject,
          html: html,
          text: text
        })
      });
      if (!resp.ok) {
        console.error('[Resend Error]', await resp.text());
      }
    } catch (e) {
      console.error('[Resend Exception]', e);
    }
  } else if (sendgridApiKey) {
    try {
      const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: toEmail }] }],
          from: { email: process.env.EMAIL_FROM || 'auth@srisai.in', name: 'Sri Sai' },
          subject: subject,
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html }
          ]
        })
      });
      if (!resp.ok) {
        console.error('[SendGrid Error]', await resp.text());
      }
    } catch (e) {
      console.error('[SendGrid Exception]', e);
    }
  } else {
    // Development/Fallback logging
    console.log(`[Email OTP Service] Verification code for ${toEmail}: ${code}`);
  }
}

/**
 * HTTPS ENDPOINT: sendEmailOtp
 * Generates secure 6-digit code, stores salted SHA-256 hash, enforces rate limits, sends email.
 */
exports.sendEmailOtp = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, error: 'Invalid email address format.' });
    }

    const emailHash = hashEmailKey(normalizedEmail);
    const otpRef = db.ref(`emailOtps/${emailHash}`);
    const existingSnap = await otpRef.once('value');
    const existing = existingSnap.val();
    const now = Date.now();

    // Rate limit: 30 seconds between requests
    if (existing && (now - existing.createdAt < 30 * 1000)) {
      const waitSec = Math.ceil((30 * 1000 - (now - existing.createdAt)) / 1000);
      return res.status(429).json({ success: false, error: `Please wait ${waitSec} seconds before requesting a new code.` });
    }

    // Rate limit: max 5 sends per hour
    if (existing && existing.hourlyCount >= 5 && (now - existing.hourlyWindowStart < 3600 * 1000)) {
      return res.status(429).json({ success: false, error: 'Too many requests. Please try again after 1 hour.' });
    }

    const hourlyCount = (existing && (now - (existing.hourlyWindowStart || 0) < 3600 * 1000))
      ? (existing.hourlyCount || 0) + 1
      : 1;

    // Generate cryptographically secure 6-digit code
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const codeHash = hashOtpCode(otpCode);

    await otpRef.set({
      codeHash: codeHash,
      email: normalizedEmail,
      createdAt: now,
      expiresAt: now + (10 * 60 * 1000), // 10 minutes
      attempts: 0,
      hourlyCount: hourlyCount,
      hourlyWindowStart: existing?.hourlyWindowStart && (now - existing.hourlyWindowStart < 3600 * 1000) ? existing.hourlyWindowStart : now
    });

    await sendTransactionalEmail(normalizedEmail, otpCode);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email.'
    });
  } catch (err) {
    console.error('[sendEmailOtp Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to send verification code. Please try again.' });
  }
});

/**
 * HTTPS ENDPOINT: verifyEmailOtp
 * Validates 6-digit code, enforces 10m expiry and max 5 attempts, maps email to Firebase user account, returns customToken.
 */
exports.verifyEmailOtp = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and 6-digit verification code are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = String(otp).trim();

    if (!/^[0-9]{6}$/.test(normalizedOtp)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 6-digit numeric code.' });
    }

    const emailHash = hashEmailKey(normalizedEmail);
    const otpRef = db.ref(`emailOtps/${emailHash}`);
    const snap = await otpRef.once('value');
    const record = snap.val();

    if (!record) {
      return res.status(400).json({ success: false, error: 'Verification code expired or not found. Please request a new code.' });
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      await otpRef.remove();
      return res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new code.' });
    }

    if (record.attempts >= 5) {
      await otpRef.remove();
      return res.status(429).json({ success: false, error: 'Too many incorrect attempts. Please request a new code.' });
    }

    const inputHash = hashOtpCode(normalizedOtp);
    const match = crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(record.codeHash));

    if (!match) {
      await otpRef.update({ attempts: (record.attempts || 0) + 1 });
      const remaining = 5 - (record.attempts || 0) - 1;
      return res.status(400).json({
        success: false,
        error: `Incorrect code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}`
      });
    }

    // Single use: delete record upon successful verification
    await otpRef.remove();

    // Map email to exact Firebase Auth user account (unified account mapping)
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(normalizedEmail);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({
          email: normalizedEmail,
          emailVerified: true,
          displayName: normalizedEmail.split('@')[0]
        });
      } else {
        throw err;
      }
    }

    // Generate Firebase Custom Token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    return res.status(200).json({
      success: true,
      customToken: customToken,
      uid: userRecord.uid,
      email: normalizedEmail
    });
  } catch (err) {
    console.error('[verifyEmailOtp Error]', err);
    return res.status(500).json({ success: false, error: 'Verification failed. Please try again.' });
  }
});

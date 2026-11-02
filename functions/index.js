/**
 * Cloud Functions for RA Store (Anantapur, Andhra Pradesh)
 * Region: asia-south1 (Mumbai) / default
 * Realtime Database triggers for Push Notifications & Scheduled Marketing Automation
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.database();

// ============================================================================
// I18N MESSAGES (ENGLISH & TELUGU)
// ============================================================================

const NOTIF_MESSAGES = {
  en: {
    placedTitle: 'Order placed ✅',
    placedBody: (id, total, slot) => `We've received order #${id} (₹${total}).${slot ? ` Delivery scheduled: ${slot}.` : ''}`,
    acceptedTitle: 'Order confirmed 👍',
    acceptedBody: (id) => `RA Store accepted order #${id}. Packing starts soon.`,
    packedTitle: 'Order packed 📦',
    packedBody: (id) => `Order #${id} is packed and ready for the rider.`,
    outForDeliveryTitle: 'On the way 🛵',
    outForDeliveryBody: (id) => `Order #${id} is out for delivery. Keep your 4-digit delivery code ready.`,
    deliveredTitle: 'Delivered ✅',
    deliveredBody: (id) => `Order #${id} delivered. Thank you for shopping with RA Store! Tap to reorder anytime.`,
    cancelledTitle: 'Order cancelled',
    cancelledBody: (id, isPaid) => `Order #${id} was cancelled.${isPaid ? ' Refund reaches your original payment method in 5-7 working days.' : ''}`,
    
    // Marketing offers
    reorderReminderTitle: 'Running low? 🛒',
    reorderReminderBody: 'Reorder your last grocery items from RA Store in one tap.',
    backInStockTitle: 'Back in Stock! 🥦',
    backInStockBody: (name) => `${name} is back in stock at RA Store! Order now for fresh delivery.`,
    priceDropTitle: 'Price Drop Alert! 🏷️',
    priceDropBody: (name, price) => `Price dropped on ${name}! Now only ₹${price} at RA Store.`,
    winBackTitle: 'We miss you at RA Store! 🛍️',
    winBackBody: 'Enjoy fast doorstep grocery delivery in Anantapur. Tap to browse fresh items.'
  },
  te: {
    placedTitle: 'ఆర్డర్ పూర్తయింది ✅',
    placedBody: (id, total, slot) => `మేము మీ ఆర్డర్ #${id} (₹${total}) ను స్వీకరించాము.${slot ? ` డెలివరీ సమయం: ${slot}.` : ''}`,
    acceptedTitle: 'ఆర్డర్ నిర్ధారించబడింది 👍',
    acceptedBody: (id) => `RA స్టోర్ ఆర్డర్ #${id} ను అంగీకరించింది. త్వరలో ప్యాకింగ్ ప్రారంభమవుతుంది.`,
    packedTitle: 'ఆర్డర్ ప్యాక్ చేయబడింది 📦',
    packedBody: (id) => `ఆర్డర్ #${id} ప్యాక్ చేయబడింది మరియు రైడర్ కోసం సిద్ధంగా ఉంది.`,
    outForDeliveryTitle: 'డెలివరీ బయలుదేరింది 🛵',
    outForDeliveryBody: (id) => `ఆర్డర్ #${id} డెలివరీ కోసం బయలుదేరింది. మీ 4 అంకెల డెలివరీ కోడ్ సిద్ధంగా ఉంచుకోండి.`,
    deliveredTitle: 'డెలివరీ చేయబడింది ✅',
    deliveredBody: (id) => `ఆర్డర్ #${id} విజయవంతంగా డెలివరీ చేయబడింది. RA స్టోర్‌లో కొనుగోలు చేసినందుకు ధన్యవాదాలు! ఎప్పుడైనా మళ్లీ ఆర్డర్ చేయవచ్చు.`,
    cancelledTitle: 'ఆర్డర్ రద్దు చేయబడింది',
    cancelledBody: (id, isPaid) => `ఆర్డర్ #${id} రద్దు చేయబడింది.${isPaid ? ' వాపసు మొత్తం 5-7 పని దినాలలో మీ ఖాతాకు చేరుతుంది.' : ''}`,
    
    // Marketing offers
    reorderReminderTitle: 'సరుకులు అయిపోతున్నాయా? 🛒',
    reorderReminderBody: 'మీ చివరి ఆర్డర్‌ను RA స్టోర్‌లో ఒక్క ట్యాప్‌తో మళ్లీ ఆర్డర్ చేయండి.',
    backInStockTitle: 'తిరిగి స్టాక్‌లోకి వచ్చింది! 🥦',
    backInStockBody: (name) => `RA స్టోర్‌లో ${name} తిరిగి అందుబాటులోకి వచ్చింది! తాజా డెలివరీ కోసం ఇప్పుడే ఆర్డర్ చేయండి.`,
    priceDropTitle: 'ధర తగ్గింది! 🏷️',
    priceDropBody: (name, price) => `${name} పై ధర తగ్గింది! ఇప్పుడు కేవలం ₹${price} మాత్రమే.`,
    winBackTitle: 'మిమ్మల్ని RA స్టోర్‌లో మిస్ అవుతున్నాము! 🛍️',
    winBackBody: 'అనంతపురంలో తాజా కిరాణా సరుకులను మీ ఇంటి వద్దే పొందండి. షాపింగ్ చేయడానికి ట్యాప్ చేయండి.'
  }
};

// ============================================================================
// HELPER: SEND PUSH NOTIFICATION VIA FCM
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
        tag: options.tag || (payload.orderId ? `ra-order-${payload.orderId}` : 'ra-store-notif'),
        type: payload.type || 'order_update'
      },
      webpush: {
        fcmOptions: {
          link: payload.url || './'
        },
        notification: {
          title: payload.title,
          body: payload.body,
          icon: './icon-192.png',
          badge: './icon-192.png',
          tag: options.tag || (payload.orderId ? `ra-order-${payload.orderId}` : 'ra-store-notif'),
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
// STEP 2: ORDER STATUS CHANGE TRIGGER
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

    // Don't send if status & payment status haven't changed
    const statusChanged = oldStatus !== newStatus;
    const paymentConfirmed = (after.paymentMethod === 'online_razorpay' && oldPayStatus !== 'paid' && newPayStatus === 'paid');
    
    if (!statusChanged && !paymentConfirmed) {
      return null;
    }

    // Guard against premature online placed notifications
    if (newStatus === 'placed' && after.paymentMethod === 'online_razorpay' && newPayStatus !== 'paid') {
      return null; // Awaiting online payment confirmation
    }

    // Idempotency: avoid sending duplicate notification if already sent for this status
    if (after.lastNotifiedStatus === newStatus && !paymentConfirmed) {
      return null;
    }

    const customerUid = after.uid;
    if (!customerUid) return null;

    // Check customer notification preferences
    const prefsSnap = await db.ref(`users/${customerUid}/notificationPreferences`).once('value');
    const prefs = prefsSnap.val() || {};
    if (prefs.orderUpdates === false) {
      return null; // Opted out of order updates
    }

    // Determine customer language (default: te)
    let userLang = 'te';
    const profileSnap = await db.ref(`users/${customerUid}/profile/lang`).once('value');
    if (profileSnap.val() === 'en') userLang = 'en';

    const t = NOTIF_MESSAGES[userLang] || NOTIF_MESSAGES.te;
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

    // Dispatch FCM notification with order tagging
    const targetUrl = `./?order=${encodeURIComponent(orderId)}#orders`;
    await sendFcmToUser(customerUid, {
      title,
      body,
      url: targetUrl,
      orderId: orderId,
      type: 'order_status_' + newStatus
    }, {
      tag: `ra-order-${orderId}`
    });

    // Mark as notified in the database idempotently
    await db.ref(`orders/${orderKey}`).update({
      lastNotifiedStatus: newStatus,
      lastNotifiedAt: new Date().toISOString()
    });

    return null;
  });

// ============================================================================
// STEP 3: ANTI-ANNOYANCE RULES ENGINE & SALES NOTIFICATIONS
// ============================================================================

/**
 * Checks all anti-annoyance rules for a customer before sending ANY marketing offer.
 * Rules enforced:
 * 1. Opted-in ("offersAndReminders" !== false) and has valid token.
 * 2. Time: 8:00 AM to 8:00 PM IST only (UTC + 5:30).
 * 3. Max 1 offer per day, max 3 offers per 7 days across all types.
 * 4. No active orders (placed, accepted, packed, out_for_delivery).
 * 5. Not within 24 hours after a delivery.
 * 6. After 4 offers in a row unopened, paused for 30 days.
 */
function evaluateAntiAnnoyanceRules(customerUid, userRecord, customerOrders, nowMs = Date.now()) {
  // 1. Opted in check
  const prefs = userRecord.notificationPreferences || {};
  if (prefs.offersAndReminders === false) {
    return { allowed: false, reason: 'opted_out' };
  }

  // 2. Active tokens check
  const tokens = userRecord.fcmTokens || {};
  if (Object.keys(tokens).length === 0) {
    return { allowed: false, reason: 'no_tokens' };
  }

  // 3. Time check: 8:00 AM - 8:00 PM IST (UTC + 5.5 hours)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(nowMs + istOffsetMs);
  const istHour = istDate.getUTCHours();
  if (istHour < 8 || istHour >= 20) {
    return { allowed: false, reason: 'outside_hours_ist' };
  }

  // 4. Active order check: none while customer has an active order
  const orders = Object.values(customerOrders || {});
  const hasActiveOrder = orders.some(o => 
    o.status === 'placed' || o.status === 'accepted' || o.status === 'packed' || o.status === 'out_for_delivery'
  );
  if (hasActiveOrder) {
    return { allowed: false, reason: 'has_active_order' };
  }

  // 5. Post-delivery cooldown: none within 24 hours after a delivery
  const twentyFourHoursAgo = nowMs - (24 * 60 * 60 * 1000);
  const recentDelivery = orders.some(o => {
    if (o.status !== 'delivered') return false;
    const deliveredTime = new Date(o.updatedAt || o.deliveredAt || o.createdAt).getTime();
    return deliveredTime > twentyFourHoursAgo;
  });
  if (recentDelivery) {
    return { allowed: false, reason: 'post_delivery_cooldown' };
  }

  // 6. Frequency cap: max 1 offer per 24 hours and max 3 offers per 7 days
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

  // 7. Unopened streak check: after 4 unopened in a row, pause for 30 days
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

/**
 * Dispatch an offer through the anti-annoyance engine and log it
 */
async function sendOfferIfEligible(customerUid, offerPayload, userRecord, customerOrders) {
  const check = evaluateAntiAnnoyanceRules(customerUid, userRecord, customerOrders);
  if (!check.allowed) {
    return { sent: false, reason: check.reason };
  }

  const offerId = `off_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const deepLink = offerPayload.url ? `${offerPayload.url}${offerPayload.url.includes('?') ? '&' : '?'}n=${offerId}` : `./?n=${offerId}`;

  // Dispatch FCM
  const res = await sendFcmToUser(customerUid, {
    title: offerPayload.title,
    body: offerPayload.body,
    url: deepLink,
    offerId: offerId,
    type: 'sales_offer'
  }, {
    tag: `ra-offer-${offerPayload.type || 'deal'}`
  });

  if (res.sentCount > 0) {
    const nowIso = new Date().toISOString();
    // Record in user offer history
    await db.ref(`users/${customerUid}/offerHistory/${offerId}`).set({
      offerId: offerId,
      type: offerPayload.type || 'generic_offer',
      title: offerPayload.title,
      sentAt: nowIso
    });

    // Record in global audit log
    await db.ref(`audit/offerLogs/${offerId}`).set({
      offerId: offerId,
      customerUid: customerUid,
      type: offerPayload.type || 'generic_offer',
      title: offerPayload.title,
      sentAt: nowIso
    });

    return { sent: true, offerId };
  }

  return { sent: false, reason: 'fcm_failed' };
}

// ============================================================================
// SCHEDULED HOURLY MARKETING CRON (8 AM - 8 PM IST)
// ============================================================================

exports.hourlyOffersJob = functions.pubsub.schedule('every 1 hours')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const now = Date.now();
    const istHour = new Date(now + 5.5 * 3600 * 1000).getUTCHours();
    if (istHour < 8 || istHour >= 20) {
      console.log('Outside IST offer hours (8:00 AM - 8:00 PM). Skipping.');
      return null;
    }

    // Check master switch in settings
    const settingsSnap = await db.ref('settings').once('value');
    const settings = settingsSnap.val() || {};
    if (settings.automaticOffersEnabled === false) {
      console.log('Automatic offers master switch disabled by owner. Skipping.');
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

    for (const [uid, userRecord] of Object.entries(users)) {
      const userOrders = allOrders.filter(o => o.uid === uid);
      if (!userOrders.length) continue;

      const userLang = (userRecord.profile && userRecord.profile.lang === 'en') ? 'en' : 'te';
      const t = NOTIF_MESSAGES[userLang] || NOTIF_MESSAGES.te;

      // Sort delivered orders descending
      const deliveredOrders = userOrders
        .filter(o => o.status === 'delivered')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (!deliveredOrders.length) continue;

      const lastDeliveredTime = new Date(deliveredOrders[0].createdAt).getTime();
      const daysSinceLastOrder = (now - lastDeliveredTime) / (24 * 3600 * 1000);

      // A. Reorder reminder based on user's own average gap
      if (deliveredOrders.length >= 2) {
        let totalGapDays = 0;
        for (let i = 0; i < deliveredOrders.length - 1; i++) {
          const gap = (new Date(deliveredOrders[i].createdAt).getTime() - new Date(deliveredOrders[i + 1].createdAt).getTime()) / (24 * 3600 * 1000);
          totalGapDays += Math.max(1, gap);
        }
        const avgGapDays = Math.round(totalGapDays / (deliveredOrders.length - 1));

        if (daysSinceLastOrder >= avgGapDays && daysSinceLastOrder < avgGapDays + 2) {
          await sendOfferIfEligible(uid, {
            type: 'reorder_reminder',
            title: t.reorderReminderTitle,
            body: t.reorderReminderBody,
            url: './#orders'
          }, userRecord, userOrders);
          continue;
        }
      }

      // C. Win-back: once after 21 days with no order
      if (daysSinceLastOrder >= 21 && daysSinceLastOrder < 22) {
        await sendOfferIfEligible(uid, {
          type: 'win_back',
          title: t.winBackTitle,
          body: t.winBackBody,
          url: './'
        }, userRecord, userOrders);
        continue;
      }
    }

    return null;
  });

// ============================================================================
// CALLABLE: OWNER BROADCAST OFFER (admin.html -> Settings)
// ============================================================================

exports.sendBroadcastOffer = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Admin authentication required.');
  }

  // Verify owner/admin
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

    // Filter by audience
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


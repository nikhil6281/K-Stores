const fs = require('fs');
const path = require('path');

const workerPath = path.join(__dirname, '..', 'worker', 'src', 'index.js');
let content = fs.readFileSync(workerPath, 'utf8');

// 1. Add FCM scope to getGoogleServiceAccessToken
const oldScope = "scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email',";
const newScope = "scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/firebase.messaging',";

if (content.includes(oldScope)) {
  content = content.replace(oldScope, newScope);
  console.log('✅ Added firebase.messaging to Google OAuth scope');
}

// 2. Add routes in fetch handler
const targetRoutes = `      // 8. POST /api/worker/verify-staff
      if (pathname === '/api/worker/verify-staff' && request.method === 'POST') {
        return await handleWorkerVerifyStaff(request, env, cors);
      }`;

const newRoutes = `      // 8. POST /api/worker/verify-staff
      if (pathname === '/api/worker/verify-staff' && request.method === 'POST') {
        return await handleWorkerVerifyStaff(request, env, cors);
      }

      // 9. POST /api/admin/send-offer (Owner marketing broadcast)
      if (pathname === '/api/admin/send-offer' && request.method === 'POST') {
        return await handleAdminSendOffer(request, env, cors);
      }

      // 10. POST /api/record-offer-open (Record offer opened)
      if (pathname === '/api/record-offer-open' && request.method === 'POST') {
        return await handleRecordOfferOpen(request, env, cors);
      }`;

if (!content.includes('/api/admin/send-offer')) {
  content = content.replace(targetRoutes, newRoutes);
  console.log('✅ Added send-offer and record-offer-open routes to Worker fetch handler');
}

// 3. Update scheduled handler to also run handleScheduledOffers
const oldScheduled = `  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduledOrderExpiry(env));
  }`;

const newScheduled = `  async scheduled(event, env, ctx) {
    ctx.waitUntil(Promise.all([
      handleScheduledOrderExpiry(env),
      handleScheduledOffers(env)
    ]));
  }`;

if (!content.includes('handleScheduledOffers(env)')) {
  content = content.replace(oldScheduled, newScheduled);
  console.log('✅ Updated scheduled handler with handleScheduledOffers');
}

// 4. Append FCM and marketing offer helper handlers
const workerNotifHandlers = `
// ==========================================
// PUSH NOTIFICATIONS & MARKETING AUTOMATION (FCM HTTP v1)
// ==========================================

async function sendFcmMessageHttpV1(env, token, payload) {
  const accessToken = await getGoogleServiceAccessToken(env);
  if (!accessToken || !env.FIREBASE_PROJECT_ID) {
    throw new Error('FCM not configured: missing Google access token or project ID');
  }

  const url = \`https://fcm.googleapis.com/v1/projects/\${env.FIREBASE_PROJECT_ID}/messages:send\`;
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
        tag: payload.tag || (payload.orderId ? \`ra-order-\${payload.orderId}\` : 'ra-store-notif'),
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
          tag: payload.tag || (payload.orderId ? \`ra-order-\${payload.orderId}\` : 'ra-store-notif'),
          renotify: true
        }
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${accessToken}\`
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
  const token = authHeader.replace(/^Bearer\\s+/i, '');
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

    const offerId = \`off_\${now}_\${Math.random().toString(36).substring(2, 6)}\`;
    const targetUrl = categoryId ? \`./?cat=\${encodeURIComponent(categoryId)}&n=\${offerId}\` : \`./?n=\${offerId}\`;

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
      await rtdbFetch(env, \`users/\${uid}/offerHistory/\${offerId}\`, 'PUT', {
        offerId,
        type: 'owner_broadcast',
        title,
        sentAt: nowIso
      });
      await rtdbFetch(env, \`audit/offerLogs/\${offerId}\`, 'PUT', {
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

  await rtdbFetch(env, \`users/\${uid}/offerHistory/\${offerId}/openedAt\`, 'PUT', new Date().toISOString());
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
          await rtdbFetch(env, \`offerBroadcasts/\${bId}/status\`, 'PUT', 'processing');
          // Mark as processed
          await rtdbFetch(env, \`offerBroadcasts/\${bId}/status\`, 'PUT', 'completed');
        }
      }
    }
  } catch (e) {
    console.warn('Scheduled offers error:', e);
  }
}
`;

if (!content.includes('sendFcmMessageHttpV1')) {
  content = content + '\n' + workerNotifHandlers;
  console.log('✅ Appended FCM & marketing offer handlers to worker/src/index.js');
}

fs.writeFileSync(workerPath, content, 'utf8');
console.log('🎉 Successfully patched worker/src/index.js');

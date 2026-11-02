const fs = require('fs');
const path = require('path');

const workerPath = path.join(__dirname, '..', 'worker', 'src', 'index.js');
let content = fs.readFileSync(workerPath, 'utf8');

// 1. Mount routes in fetch()
const targetStaffRoute = `      // 8. POST /api/worker/verify-staff
      if (pathname === '/api/worker/verify-staff' && request.method === 'POST') {
        return await handleWorkerVerifyStaff(request, env, cors);
      }`;

const mountedRoutes = `      // 8. POST /api/worker/verify-staff
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
      }`;

if (!content.includes('/api/notify-order-status')) {
  content = content.replace(
    /\/\/\s*8\.\s*POST\s*\/api\/worker\/verify-staff[\s\S]*?return\s+await\s+handleWorkerVerifyStaff\(request,\s*env,\s*cors\);\s*\}/,
    mountedRoutes
  );
  console.log('✅ Mounted missing routes into fetch() router');
}

// 2. Update scheduled() event handler to run all 3 cron tasks
const targetScheduled = `  // Scheduled Cron Event (every 5 minutes): Expire unpaid online orders
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduledOrderExpiry(env));
  }`;

const newScheduled = `  // Scheduled Cron Event (every 5 minutes): Expire unpaid orders, purge old geo, run scheduled offers
  async scheduled(event, env, ctx) {
    ctx.waitUntil(Promise.all([
      handleScheduledOrderExpiry(env),
      handlePurgeOldDeliveryGeo(env),
      handleScheduledOffers(env)
    ]));
  }`;

if (!content.includes('handlePurgeOldDeliveryGeo(env)')) {
  content = content.replace(
    /\/\/\s*Scheduled\s+Cron\s+Event[\s\S]*?ctx\.waitUntil\(handleScheduledOrderExpiry\(env\)\);\s*\}/,
    newScheduled
  );
  console.log('✅ Updated scheduled() cron handler');
}

// 3. Add sendOrderStatusNotification & handleNotifyOrderStatus
const notificationHelpers = `
// ==========================================
// ORDER STATUS NOTIFICATIONS (Bilingual EN/TE)
// ==========================================

async function sendOrderStatusNotification(env, order, newStatus) {
  if (!order || !order.uid || !newStatus) return;
  try {
    const user = await rtdbFetch(env, \`users/\${order.uid}\`, 'GET');
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
        placedBody: \`We've received order #\${orderId} (₹\${order.total || ''}).\`,
        acceptedTitle: 'Order confirmed 👍',
        acceptedBody: \`RA Store accepted order #\${orderId}. Packing starts soon.\`,
        packedTitle: 'Order packed 📦',
        packedBody: \`Order #\${orderId} is packed and ready for the rider.\`,
        out_for_deliveryTitle: 'On the way 🛵',
        out_for_deliveryBody: \`Order #\${orderId} is out for delivery. Keep your 4-digit delivery code ready.\`,
        deliveredTitle: 'Delivered ✅',
        deliveredBody: \`Order #\${orderId} delivered. Thank you for shopping with RA Store!\`,
        cancelledTitle: 'Order cancelled',
        cancelledBody: \`Order #\${orderId} was cancelled.\`
      },
      te: {
        placedTitle: 'ఆర్డర్ పూర్తయింది ✅',
        placedBody: \`మేము మీ ఆర్డర్ #\${orderId} (₹\${order.total || ''}) ను స్వీకరించాము.\`,
        acceptedTitle: 'ఆర్డర్ నిర్ధారించబడింది 👍',
        acceptedBody: \`RA స్టోర్ ఆర్డర్ #\${orderId} ను అంగీకరించింది. త్వరలో ప్యాకింగ్ ప్రారంభమవుతుంది.\`,
        packedTitle: 'ఆర్డర్ ప్యాక్ చేయబడింది 📦',
        packedBody: \`ఆర్డర్ #\${orderId} ప్యాక్ చేయబడింది మరియు రైడర్ కోసం సిద్ధంగా ఉంది.\`,
        out_for_deliveryTitle: 'డెలివరీ బయలుదేరింది 🛵',
        out_for_deliveryBody: \`ఆర్డర్ #\${orderId} డెలివరీ కోసం బయలుదేరింది. మీ 4 అంకెల డెలివరీ కోడ్ సిద్ధంగా ఉంచుకోండి.\`,
        deliveredTitle: 'డెలివరీ చేయబడింది ✅',
        deliveredBody: \`ఆర్డర్ #\${orderId} విజయవంతంగా డెలివరీ చేయబడింది. RA స్టోర్‌లో కొనుగోలు చేసినందుకు ధన్యవాదాలు!\`,
        cancelledTitle: 'ఆర్డర్ రద్దు చేయబడింది',
        cancelledBody: \`ఆర్డర్ #\${orderId} రద్దు చేయబడింది.\`
      }
    };

    const dict = msgs[lang] || msgs['te'];
    const title = dict[\`\${newStatus}Title\`] || \`Order Update: #\${orderId}\`;
    const body = dict[\`\${newStatus}Body\`] || \`Order #\${orderId} status is now \${newStatus}\`;

    const targetUrl = \`./?order=\${encodeURIComponent(orderId)}#orders\`;

    for (const fcmToken of tokens) {
      try {
        await sendFcmMessageHttpV1(env, fcmToken, {
          title: title,
          body: body,
          url: targetUrl,
          orderId: orderId,
          tag: \`ra-order-\${orderId}\`,
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

  let order = await rtdbFetch(env, \`orders/\${orderId}\`, 'GET');
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
`;

if (!content.includes('function sendOrderStatusNotification(')) {
  content += '\n' + notificationHelpers;
  console.log('✅ Injected sendOrderStatusNotification & handleNotifyOrderStatus');
}

// 4. Call sendOrderStatusNotification in handleAdminUpdateOrder
if (!content.includes('await sendOrderStatusNotification(env, orderData, newStatus);')) {
  content = content.replace(
    /(await rtdbFetch\(env,\s*`orders\/\$\{pushKey\}`,\s*'PATCH',\s*updates\);)/,
    '$1\n  await sendOrderStatusNotification(env, orderData, newStatus);'
  );
  console.log('✅ Wired sendOrderStatusNotification in handleAdminUpdateOrder');
}

// 5. Call sendOrderStatusNotification in handleVerifyDeliveryOtp
if (!content.includes('await sendOrderStatusNotification(env, order, \'delivered\');')) {
  content = content.replace(
    /(await rtdbFetch\(env,\s*`orders\/\$\{order\.pushKey\}`,\s*'PATCH',\s*updates\);[\s\S]*?return jsonResponse\(\{ success: true, orderId: order\.id, status: 'delivered')/,
    'await sendOrderStatusNotification(env, order, \'delivered\');\n  $1'
  );
  console.log('✅ Wired sendOrderStatusNotification in handleVerifyDeliveryOtp');
}

// 6. Call sendOrderStatusNotification in handleCancelOrder
if (!content.includes('await sendOrderStatusNotification(env, orderData, \'cancelled\');')) {
  content = content.replace(
    /(await rtdbFetch\(env,\s*`orders\/\$\{pushKey\}`,\s*'PATCH',\s*updates\);[\s\S]*?return jsonResponse\(\{ success: true, orderId: orderData\.id, status: 'cancelled')/,
    'await sendOrderStatusNotification(env, orderData, \'cancelled\');\n  $1'
  );
  console.log('✅ Wired sendOrderStatusNotification in handleCancelOrder');
}

// 7. Call sendOrderStatusNotification in handleCreateOrder (for COD placed)
if (!content.includes('await sendOrderStatusNotification(env, orderRecord, \'placed\');')) {
  content = content.replace(
    /(await rtdbFetch\(env,\s*`orders\/\$\{orderPushKey\}`,\s*'PUT',\s*orderRecord\);)/,
    '$1\n    await sendOrderStatusNotification(env, orderRecord, \'placed\');'
  );
  console.log('✅ Wired sendOrderStatusNotification in handleCreateOrder (COD)');
}

fs.writeFileSync(workerPath, content, 'utf8');
console.log('🎉 worker/src/index.js router and notifications successfully patched!');

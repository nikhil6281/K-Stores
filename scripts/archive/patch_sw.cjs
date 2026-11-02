const fs = require('fs');
const path = require('path');

const newPushSection = `// 7. Web Push Notifications (FCM & Web Push compliant)
self.addEventListener('push', (e) => {
  let payload = { title: 'RA Store', body: 'New update from RA Store!' };
  let customData = {};

  try {
    if (e.data) {
      const parsed = e.data.json();
      if (parsed.notification) {
        payload.title = parsed.notification.title || payload.title;
        payload.body = parsed.notification.body || payload.body;
      } else if (parsed.title) {
        payload.title = parsed.title;
        payload.body = parsed.body || payload.body;
      }
      customData = parsed.data || parsed;
    }
  } catch (err) {
    if (e.data) payload.body = e.data.text();
  }

  const orderId = customData.orderId || '';
  const offerId = customData.offerId || '';
  const notifTag = customData.tag || (orderId ? \`ra-order-\${orderId}\` : (offerId ? \`ra-offer-\${offerId}\` : 'ra-store-notif'));
  const targetUrl = customData.url || (orderId ? \`./?order=\${encodeURIComponent(orderId)}#orders\` : (offerId ? \`./?n=\${encodeURIComponent(offerId)}\` : './'));

  const options = {
    body: payload.body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [100, 50, 100],
    tag: notifTag,
    renotify: true,
    data: {
      url: targetUrl,
      orderId: orderId,
      offerId: offerId,
      type: customData.type || 'general'
    }
  };

  e.waitUntil(self.registration.showNotification(payload.title, options));
});

// 8. Notification Click (Focus or Open & route to order)
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const notifData = e.notification.data || {};
  const urlToOpen = notifData.url || './';
  const orderId = notifData.orderId;

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and tell it to open the order modal
      for (let client of windowClients) {
        if ('focus' in client) {
          client.focus();
          if (orderId) {
            client.postMessage({ type: 'NAVIGATE_TO_ORDER', orderId: orderId });
          }
          return;
        }
      }
      // If no window is open, open a new window to the target URL
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});`;

['sw.js', 'public/sw.js'].forEach(relPath => {
  const fullPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace from // 7. Web Push Notifications to the end
  const pushIdx = content.indexOf('// 7. Web Push Notifications');
  if (pushIdx !== -1) {
    content = content.slice(0, pushIdx) + newPushSection + '\n';
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated push & click handler in ${relPath}`);
  } else {
    console.warn(`⚠️ Could not find push marker in ${relPath}`);
  }
});

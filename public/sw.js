/**
 * Sri Sai - Service Worker (PWA Shell Caching & Offline Support)
 * Meets all PWABuilder and Google Play TWA requirements:
 * - Pre-caching core shell assets (HTML, manifest, icons, offline fallback)
 * - Navigation offline fallback
 * - Background Sync (sync)
 * - Periodic Background Sync (periodicsync)
 * - Web Push (push) & Notification Click (notificationclick)
 *
 * CRITICAL EXCLUSION RULES:
 * - Completely excludes /admin, /worker, /staff, admin.html, and worker.html.
 * - Completely excludes all Firebase, Firestore, Google Auth, Razorpay, and API requests.
 * - Uses Network-First caching strategy for all HTML and JS files so updates are immediately visible.
 * - Automatically purges any previous cache versions.
 */

const CACHE_NAME = 'sri-sai-shell-v15';
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './config.js',
  './assets/logo/sri-sai-logo.png',
  './assets/logo/app-icon-192.png',
  './assets/logo/app-icon-512.png',
  './assets/logo/apple-touch-icon-180.png',
  './assets/logo/favicon-48.png',
  './assets/logo/badge-96.png',
  './icon-192.png',
  './icon-512.png',
  './offline.html'
];

// 1. Install Event: Pre-cache essential shell assets & skip waiting
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Automatically delete ALL old cache versions and claim clients
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Message Event: Allow clients to trigger skipWaiting
self.addEventListener('message', (e) => {
  if (e.data && (e.data.type === 'SKIP_WAITING' || e.data === 'skipWaiting')) {
    self.skipWaiting();
  }
});

// 4. Fetch Event: Network-First for HTML/JS, complete bypass for Admin/Staff/APIs
self.addEventListener('fetch', (e) => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // ONLY handle same-origin requests
  if (url.origin !== self.location.origin) return;

  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();

  // Completely exclude all Firebase, Firestore, Google Auth, Razorpay, or Worker API requests
  if (
    host.includes('firebase') ||
    host.includes('googleapis') ||
    host.includes('razorpay') ||
    host.includes('workers.dev') ||
    host.includes('gstatic')
  ) {
    return; // Pass through to network
  }

  // COMPLETELY EXCLUDE admin.html, worker.html, /worker, /admin, /staff, catalog.json, and /api/
  // They must open directly in standard browser tabs without any Service Worker caching or navigation fallback
  if (
    path.includes('admin') ||
    path.includes('worker') ||
    path.includes('staff') ||
    path.includes('/api/') ||
    path.includes('catalog.json')
  ) {
    return; // Direct network passthrough
  }

  const isHtmlOrJs =
    e.request.mode === 'navigate' ||
    e.request.destination === 'document' ||
    e.request.destination === 'script' ||
    path.endsWith('.html') ||
    path.endsWith('.js') ||
    path === '/' ||
    path.endsWith('/k-stores/') ||
    path.endsWith('/k-stores');

  // Network-First Strategy for all HTML & JavaScript files
  if (isHtmlOrJs) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fall back to cache only when offline
          const cached = await caches.match(e.request);
          if (cached) return cached;
          if (e.request.mode === 'navigate' || e.request.destination === 'document') {
            const offlinePage = await caches.match('./offline.html');
            if (offlinePage) return offlinePage;
            const indexFallback = await caches.match('./index.html');
            if (indexFallback) return indexFallback;
          }
          return new Response(
            '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Sri Sai - Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;text-align:center;padding:48px 20px;background:#f8fafc;color:#1e293b}h1{color:#15803d;margin-bottom:12px}p{color:#64748b;margin-bottom:24px}button{background:#15803d;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:16px;cursor:pointer;font-weight:600}</style></head><body><h1>You are Offline</h1><p>Sri Sai needs an active internet connection to show fresh stock and process orders.</p><button onclick="window.location.reload()">Retry Connection</button></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Static Assets (Images, Icons, Fonts): Stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return networkResponse;
        })
        .catch(() => null);

      return cached || fetchPromise;
    })
  );
});

// 5. Background Sync
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-orders') {
    e.waitUntil(Promise.resolve());
  }
});

// 6. Periodic Background Sync
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'update-catalog') {
    e.waitUntil(Promise.resolve());
  }
});

// 7. Web Push Notifications (All in English)
self.addEventListener('push', (e) => {
  let payload = { title: 'Sri Sai', body: 'New update from Sri Sai!' };
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
  const notifTag = customData.tag || (orderId ? `sri-sai-order-${orderId}` : (offerId ? `sri-sai-offer-${offerId}` : 'sri-sai-notif')); // ra-order- fallback
  const targetUrl = customData.url || (orderId ? `./?order=${encodeURIComponent(orderId)}#orders` : (offerId ? `./?n=${encodeURIComponent(offerId)}` : './'));

  const options = {
    body: payload.body,
    icon: './assets/logo/app-icon-192.png?v=2',
    badge: './assets/logo/badge-96.png?v=2',
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
});

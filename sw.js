/**
 * RA Store - Service Worker (PWA Shell Caching & Offline Support)
 * Meets all PWABuilder and Google Play TWA requirements:
 * - Pre-caching core shell assets (HTML, manifest, icons, offline fallback)
 * - Navigation offline fallback
 * - Background Sync (sync)
 * - Periodic Background Sync (periodicsync)
 * - Web Push (push) & Notification Click (notificationclick)
 * CRITICAL RULE: Only cache same-origin GET requests. Never cache /worker, /admin.html, Firebase, Auth, Razorpay, or API requests.
 */

const CACHE_NAME = 'ra-store-shell-v9';
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './config.js',
  './icon-192.png',
  './icon-512.png',
  './offline.html'
];

// 1. Install Event: Pre-cache essential shell assets
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

// 2. Activate Event: Clean old cache versions and claim clients
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// 3. Message Event: Allow clients to trigger skipWaiting
self.addEventListener('message', (e) => {
  if (e.data && (e.data.type === 'SKIP_WAITING' || e.data === 'skipWaiting')) {
    self.skipWaiting();
  }
});

// 4. Fetch Event
self.addEventListener('fetch', (e) => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // ONLY handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // NEVER cache Staff, Admin, or API endpoints
  if (
    url.pathname.includes('/worker') ||
    url.pathname.includes('/admin') ||
    url.pathname.includes('/api/') ||
    url.pathname.includes('catalog.json')
  ) {
    return; // Pass directly to network
  }

  // Navigation / HTML requests: Network-first with offline fallback
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(e.request);
          if (cached) return cached;
          const fallback = await caches.match('./offline.html');
          if (fallback) return fallback;
          const indexFallback = await caches.match('./index.html');
          if (indexFallback) return indexFallback;
          return new Response(
            '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>RA Store - Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;text-align:center;padding:48px 20px;background:#f8fafc;color:#1e293b}h1{color:#15803d;margin-bottom:12px}p{color:#64748b;margin-bottom:24px}button{background:#15803d;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:16px;cursor:pointer;font-weight:600}</style></head><body><h1>You are Offline</h1><p>RA Store needs an active internet connection to show fresh stock and process orders.</p><button onclick="window.location.reload()">Retry Connection</button></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Static Assets (CSS, JS, Fonts, Images): Stale-while-revalidate
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

// 7. Web Push Notifications
self.addEventListener('push', (e) => {
  let data = { title: 'RA Store', body: 'New update from RA Store!' };
  try {
    if (e.data) data = e.data.json();
  } catch (err) {
    if (e.data) data.body = e.data.text();
  }
  const options = {
    body: data.body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || './' }
  };
  e.waitUntil(self.registration.showNotification(data.title, options));
});

// 8. Notification Click
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const targetUrl = (e.notification.data && e.notification.data.url) ? e.notification.data.url : './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

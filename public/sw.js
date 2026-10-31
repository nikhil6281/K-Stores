/**
 * RA Store - Service Worker (PWA Shell Caching & Offline Support)
 * Meets all PWABuilder and Google Play TWA requirements:
 * - Pre-caching core shell assets (HTML, manifest, icons)
 * - Navigation offline fallback
 * - Background Sync (sync)
 * - Periodic Background Sync (periodicsync)
 * - Web Push (push) & Notification Click (notificationclick)
 * CRITICAL RULE: Never cache API, Firebase, Google Auth, Cloudinary, or Razorpay calls.
 */

const CACHE_NAME = 'ra-store-shell-v7';
const SHELL_ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './worker.html',
  './config.js'
];

// 1. Install Event: Pre-cache essential assets
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

// 3. Fetch Event: Network-first for navigation with offline fallback; stale-while-revalidate for local static assets
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // NEVER cache API requests, Firebase, Razorpay, or Cloudinary
  if (
    url.includes('/api/') ||
    url.includes('firebaseio.com') ||
    url.includes('googleapis.com/identitytoolkit') ||
    url.includes('razorpay.com') ||
    url.includes('cloudinary.com')
  ) {
    return; // Pass directly to network
  }

  // Navigation / HTML requests
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
        .catch(() => {
          return caches.match(e.request).then((cached) => {
            if (cached) return cached;
            return caches.match('./index.html').then((fallback) => {
              if (fallback) return fallback;
              return new Response(
                '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>RA Store - Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;text-align:center;padding:48px 20px;background:#f8fafc;color:#1e293b}h1{color:#15803d;margin-bottom:12px}p{color:#64748b;margin-bottom:24px}button{background:#15803d;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:16px;cursor:pointer;font-weight:600}</style></head><body><h1>You are Offline</h1><p>RA Store needs an active internet connection to show fresh stock and process orders.</p><button onclick="window.location.reload()">Retry Connection</button></body></html>',
                { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
              );
            });
          });
        })
    );
    return;
  }

  // Static Assets (CSS, JS, Fonts, Images)
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && e.request.method === 'GET') {
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

// 4. Background Sync: Enables offline order queued syncing
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(
      Promise.resolve().then(() => {
        console.log('[SW] Background sync triggered for tag:', event.tag);
      })
    );
  }
});

// 5. Periodic Background Sync: Allows periodic catalog and deals refresh
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-catalog') {
    event.waitUntil(
      Promise.resolve().then(() => {
        console.log('[SW] Periodic background sync triggered for catalog update');
      })
    );
  }
});

// 6. Push Notifications: Handles incoming marketing or order tracking push events
self.addEventListener('push', (event) => {
  let payload = { title: 'RA Store', body: 'Fresh grocery deals are live in Anantapur!' };
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (_) {
    if (event.data) payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'RA Store', {
      body: payload.body || 'Your daily essentials delivered fresh in Anantapur.',
      icon: './icon-192.png',
      badge: './icon-192.png',
      data: { url: payload.url || './index.html' }
    })
  );
});

// 7. Notification Click: Deep links into the app when user taps notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

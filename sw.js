/**
 * RA Store - Service Worker (PWA Shell Caching)
 * Network-first for navigation/HTML, stale-while-revalidate for local assets.
 * CRITICAL RULE: Never cache API, Firebase, Google Auth, Cloudinary, or Razorpay calls.
 */

const CACHE_NAME = 'ra-store-shell-v4';
const SHELL_ASSETS = [
  './index.html',
  './config.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

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
    return; // Pass through to network
  }

  // 1. Navigation / HTML requests: Network-First (with cache fallback for offline)
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('./index.html');
        })
    );
    return;
  }

  // 2. Static shell assets: Stale-While-Revalidate
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

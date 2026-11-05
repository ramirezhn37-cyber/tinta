const CACHE_NAME = 'tinta-viva-v1';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './js/storage.js',
  './js/analyze-drawing.js',
  './js/engine/rarity.js',
  './js/engine/catchphrases.js',
  './js/engine/tics.js',
  './js/engine/personality.js',
  './js/chat/intentClassifier.js',
  './js/chat/responseBank.js',
  './js/chat/moodEngine.js',
  './js/chat/memory.js',
  './js/chat/chatEngine.js',
  './js/transfer.js',
  './js/draw.js',
  './js/app.js',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './icons/icon-maskable-192.svg',
  './icons/icon-maskable-512.svg',
  './icons/favicon.svg',
  './icons/apple-touch-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Network-first for navigations, fall back to cached app shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache-first for same-origin static assets.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Stale-while-revalidate for cross-origin (fonts, etc.) with opaque caching.
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request, { mode: 'no-cors' })
        .then((response) => {
          if (response) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

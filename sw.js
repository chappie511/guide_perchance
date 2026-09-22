// sw.js
const SW_VERSION = 'v1.4.8';
const CACHE_NAME = `Version-${SW_VERSION}`;

const TOTAL_SECTIONS = 24;

const SECTIONS = Array.from({ length: TOTAL_SECTIONS }, (_, i) => 
  `./sections_du_guide/section_${String(i + 1).padStart(2, '0')}.html`
);

// Retrait de version.js de la liste pour éviter de le bloquer en cache
const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/index.css',
  './js/lucide.min.js',
  './js/index.js',
  'https://cdn.jsdelivr.net/gh/chappie511/Icon@main/golden_star_v3.png?v=1000',
  ...SECTIONS
];

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(LOCAL_ASSETS))
  );
});

// Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Réception du message depuis index.js pour rafraîchir
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data.action === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

// Requêtes réseau
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // TOUJOURS chercher version.js sur le réseau (Network Only)
  if (url.pathname.endsWith('version.js')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Domaines externes
  if (url.origin !== location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200 || networkResponse.status === 0) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        }).catch(() => {});
      })
    );
    return;
  }

  // Ressources locales (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {});

      return cachedResponse || fetchPromise;
    })
  );
});

// 1. Chargement de la version centralisée
importScripts('./version.js');

// 2. Utilisation de la constante définie dans version.js
const CACHE_NAME = `guide-cache-${APP_VERSION}`;

const TOTAL_SECTIONS = 24;

// Liste dynamique des 24 sections HTML
const SECTIONS = Array.from({ length: TOTAL_SECTIONS }, (_, i) => 
  `./sections_du_guide/section_${String(i + 1).padStart(2, '0')}.html`
);

// Ressources locales à mettre en cache
const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './version.js',
  './index.css',
  './js/lucide.min.js',
  './js/index.js', 'https://cdn.jsdelivr.net/gh/chappie511/Icon@main/golden_star_v3.png?v=1000',
  ...SECTIONS
];


// 1. Installation du Service Worker et mise en cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(LOCAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 2. Nettoyage des anciens caches lors de la mise à jour
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

// 3. Réception des commandes depuis index.js (Bandeau Toast)
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data.action === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

// 4. Interception des requêtes réseau (Network-First / Cache-First)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // CAS A : CDN externe -> Cache-First
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

  // CAS B : Application locale -> Network-First
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

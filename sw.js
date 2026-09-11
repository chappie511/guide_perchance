const CACHE_NAME = 'perchance-guide-v3';

const BASE_ASSETS = [
  './',
  './index.html',
  './css/index.css',
  './js/index.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/gh/chappie511/Icon@main/golden_star_v3.png?v=1000'
];

const SECTION_ASSETS = Array.from({ length: 24 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `./sections_du_guide/section_${num}.html`;
});

const ASSETS_TO_CACHE = [...BASE_ASSETS, ...SECTION_ASSETS];

// Installation du nouveau cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Nettoyage automatique des anciens caches (v1, v2...) lors de l'activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Service des ressources : Réseau d'abord, secours sur le cache si hors-ligne
self.addEventListener('fetch', (event) => {
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

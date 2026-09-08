const CACHE_NAME = 'perchance-guide-v1';

// Fichiers de base à mettre en cache immédiatement
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/index.css',
  './js/index.js'
];

// Installation : mise en cache initiale
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches si nécessaire
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Interception des requêtes : sert le cache d'abord, puis va chercher sur le réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Met en cache dynamiquement les sections HTML téléchargées
        if (event.request.url.includes('/sections_du_guide/')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});

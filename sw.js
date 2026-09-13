const CACHE_NAME = 'guide-perchance-v1.2.3';

const BASE_ASSETS = [
  './',
  './index.html',
  './version.js',
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

// Installation tolérante aux erreurs
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('Impossible de mettre en cache la ressource :', asset, err);
        }
      }
    })
  );
});

// Nettoyage automatique des anciens caches et prise de contrôle immédiate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache :', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Cache First pour les icônes et CDNs externes
  if (url.origin.includes('cdn.jsdelivr.net') || url.origin.includes('github.io')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 2. Network First avec secours sur le cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Activation immédiate sur demande du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

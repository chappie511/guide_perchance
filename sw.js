const CACHE_NAME = 'guide-perchance-v1.2.9';

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

// Remplacez l'événement activate par celui-ci (suppression de self.clients.claim()) :
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('Suppression de l\'ancien cache :', key);
            return caches.delete(key);
          })
      );
    })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

    // 1. Contournement du cache pour version.js (données fraîches avec mise en cache dynamique)
  if (url.pathname.endsWith('version.js')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }


  // 2. Cache First pour les icônes et CDNs externes
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

    // 3. Network First avec secours sur le cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // On ne met en cache que les réponses valides du même domaine (status 200)
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        // En cas de coupure réseau ou d'échec fetch, on bascule sur la copie en cache
        return caches.match(event.request);
      })
  );
});

// Activation immédiate lorsque l'utilisateur clique sur "Rafraîchir"
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

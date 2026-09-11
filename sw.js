const CACHE_NAME = 'perchance-guide-dynamic';

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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then(async (networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              // Si nous avons une version en cache, on compare le contenu
              if (cachedResponse) {
                const cachedText = await cachedResponse.clone().text();
                const networkText = await networkResponse.clone().text();

                // On ne met à jour et n'alerte QUE si le contenu a changé
                if (cachedText !== networkText) {
                  await cache.put(event.request, networkResponse.clone());
                  
                  self.clients.matchAll().then((clients) => {
                    clients.forEach((client) => {
                      client.postMessage({ type: 'NEW_CONTENT_AVAILABLE' });
                    });
                  });
                }
              } else {
                // Premier enregistrement dans le cache
                await cache.put(event.request, networkResponse.clone());
              }
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      });
    })
  );
});

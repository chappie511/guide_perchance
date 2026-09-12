const CACHE_NAME = 'guide-perchance-v1.4'; // Change la version

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
            return caches.delete(key); // Supprime l'ancien cache v4
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});


// Service des ressources : Réseau d'abord avec secours sur le cache
self.addEventListener('fetch', (event) => {
  // On ne traite que les requêtes GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Accepte le statut 200 (OK) ainsi que 304 / 0 (opaque)
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        // En cas de panne réseau ou hors-ligne, récupérer dans le cache
        return caches.match(event.request);
      })
  );
});

// Écoute du message envoyé depuis index.js lors du clic sur "Rafraîchir"
self.addEventListener('install', (event) => {
  // On NE met PAS self.skipWaiting() ici, pour qu'il reste en attente (waiting)
  // ... ton code de mise en cache habituel ...
});

// C'est uniquement ici, lorsqu'on reçoit le message du clic sur le toast, qu'on force l'activation
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache :', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

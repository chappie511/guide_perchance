const CACHE_NAME = 'perchance-guide-dynamic';

// 1. Liste des ressources de base
const BASE_ASSETS = [
  './',
  './index.html',
  './css/index.css',
  './js/index.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/gh/chappie511/Icon@main/golden_star_v3.png?v=1000'
];

// 2. Génération automatique des 24 sections
const SECTION_ASSETS = Array.from({ length: 24 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `./sections_du_guide/section_${num}.html`;
});

const ASSETS_TO_CACHE = [...BASE_ASSETS, ...SECTION_ASSETS];

// Installation : mise en cache initiale
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Interception des requêtes : Stratégie Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Lancement du téléchargement en arrière-plan pour la prochaine fois
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse); // En mode avion, ignore l'erreur réseau

        // Retourne la version en cache immédiatement si elle existe, sinon attend le réseau
        return cachedResponse || fetchPromise;
      });
    })
  );
});

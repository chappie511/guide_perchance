const CACHE_NAME = 'perchance-guide-v2';

// 1. Liste des ressources de base de l'interface
const BASE_ASSETS = [
  './',
  './index.html',
  './css/index.css',
  './js/index.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/gh/chappie511/Icon@main/golden_star_v3.png?v=1000'
];

// 2. Génération automatique des chemins vers les 24 sections
const SECTION_ASSETS = Array.from({ length: 24 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `./sections_du_guide/section_${num}.html`;
});

// 3. Fusion de toutes les ressources à mettre en cache
const ASSETS_TO_CACHE = [...BASE_ASSETS, ...SECTION_ASSETS];

// Installation : Pré-chargement global de tous les fichiers
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation : Nettoyage des anciennes versions de cache
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

// Interception des requêtes : Réseau en priorité, puis Cache de secours
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la connexion fonctionne, on met à jour le cache au passage
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // En cas de perte de réseau (hors-ligne), on utilise le cache local
        return caches.match(event.request);
      })
  );
});

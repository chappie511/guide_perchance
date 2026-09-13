// Définition directe dans le Service Worker
const APP_VERSION = '1.3.0';
const CACHE_NAME = `guide-cache-v${APP_VERSION}`;

// 1. Ressources de base du guide
const BASE_ASSETS = [
  './',
  './index.html',
  './css/index.css',
  './js/index.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/gh/chappie511/Icon@main/golden_star_v3.png?v=1000'
];

// 2. Génération automatique de la liste des 24 sections HTML
const SECTION_ASSETS = Array.from({ length: 24 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `./sections_du_guide/section_${num}.html`;
});

// Assemblage complet des fichiers à mettre en cache
const ASSETS_TO_CACHE = [...BASE_ASSETS, ...SECTION_ASSETS];

// -------------------------------------------------------------
// ÉVÉNEMENT INSTALL : Mise en cache tolérante aux erreurs
// -------------------------------------------------------------
self.addEventListener('install', (event) => {
  console.log('[SW Guide] Installation du cache :', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('[SW Guide] Fichier introuvable ou échec de mise en cache :', asset, err);
        }
      }
    })
  );
});

// -------------------------------------------------------------
// ÉVÉNEMENT ACTIVATE : Nettoyage des anciens caches
// -------------------------------------------------------------
self.addEventListener('activate', (event) => {
  console.log('[SW Guide] Activation et nettoyage des anciens caches...');
  
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW Guide] Suppression de l\'ancien cache :', key);
            return caches.delete(key);
          })
      );
    })
  );
});

// -------------------------------------------------------------
// ÉVÉNEMENT FETCH : Stratégies de requêtes réseau / cache
// -------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // A. Cache First pour les CDN externes (icônes, scripts)
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

  // B. Network First avec secours sur le cache pour l'application
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

// -------------------------------------------------------------
// ÉVÉNEMENT MESSAGE : Prise de contrôle à la demande (Bandeau Toast)
// -------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data.action === 'skipWaiting')) {
    self.skipWaiting();
  }
});

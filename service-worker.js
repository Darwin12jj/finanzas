'use strict';

const CACHE = 'finanzapp-v1';

const ASSETS = [
  './',
  './index.html',
  './login.html',
  './manifest.json',
  './css/styles.css',
  './js/firebase-config.js',
  './js/utils.js',
  './js/nav.js',
  './js/auth.js',
  './js/db.js',
  './js/pwa.js',
  './pages/ingresos.html',
  './pages/egresos.html',
  './pages/presupuesto.html',
  './pages/metas.html',
  './pages/historico.html',
  './pages/ajustes.html',
  './pages/categorias.html',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
];

// ── Install: cachea todos los assets estáticos ────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: elimina cachés viejas ──────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: caché para assets, red para Firebase ───────────────────────────
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Firebase, CDN y externos → siempre red
  if (url.includes('firebase') ||
      url.includes('googleapis') ||
      url.includes('gstatic') ||
      url.includes('jsdelivr') ||
      url.includes('svgrepo') ||
      !url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Sin red y sin caché → devuelve index.html como fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

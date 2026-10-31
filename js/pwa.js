'use strict';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Resuelve la ruta al SW según si estamos en pages/ o en la raíz
    const inPages = window.location.pathname.includes('/pages/');
    const swUrl   = inPages ? '../service-worker.js' : './service-worker.js';

    navigator.serviceWorker.register(swUrl)
      .then(reg => {
        // Cuando haya una nueva versión disponible, recarga automáticamente
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'activated' && navigator.serviceWorker.controller) {
              // Nueva versión instalada — recarga silenciosa
              window.location.reload();
            }
          });
        });
      })
      .catch(() => {}); // Silencioso si falla (ej: localhost sin HTTPS)
  });
}

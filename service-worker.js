// service-worker.js
// Caches the app shell so the PWA works fully offline after the first load.
// This worker never talks to any server except to fetch these static files.

const CACHE_NAME = 'invoicing-cache-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/db/database.js',
  './js/db/repository.js',
  './js/utils/uid.js',
  './js/utils/money.js',
  './js/utils/numbering.js',
  './js/utils/pdf.js',
  './js/utils/backup.js',
  './js/utils/router.js',
  './js/utils/toast.js',
  './js/views/dashboard.js',
  './js/views/clients.js',
  './js/views/clientForm.js',
  './js/views/services.js',
  './js/views/serviceForm.js',
  './js/views/invoices.js',
  './js/views/invoiceForm.js',
  './js/views/invoicePreview.js',
  './js/views/settings.js',
  './js/vendor/jspdf.umd.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first, falling back to network, and updating the cache in the background.
// All data lives in IndexedDB (handled elsewhere) - this worker only ever
// serves static application files, never client or invoice data.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});

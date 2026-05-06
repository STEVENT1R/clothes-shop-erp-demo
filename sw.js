// Service Worker for Clothes ERP Demo - v2
const CACHE_NAME = 'clothes-erp-v2';
const ASSETS = [
  '/clothes-erp-demo/',
  '/clothes-erp-demo/index.html',
  '/clothes-erp-demo/css/style.css',
  '/clothes-erp-demo/manifest.json',
  '/clothes-erp-demo/icons/icon-192.png',
  '/clothes-erp-demo/icons/icon-512.png',
  '/clothes-erp-demo/js/modules/data.js',
  '/clothes-erp-demo/js/modules/auth.js',
  '/clothes-erp-demo/js/modules/theme.js',
  '/clothes-erp-demo/js/modules/products.js',
  '/clothes-erp-demo/js/modules/sales.js',
  '/clothes-erp-demo/js/modules/inventory.js',
  '/clothes-erp-demo/js/modules/purchases.js',
  '/clothes-erp-demo/js/modules/suppliers.js',
  '/clothes-erp-demo/js/modules/logs.js',
  '/clothes-erp-demo/js/modules/profit.js',
  '/clothes-erp-demo/js/modules/dashboard.js',
  '/clothes-erp-demo/js/modules/app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request).then(response => {
        // Cache new requests on the fly
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, responseClone);
        });
        return response;
      }).catch(() => {
        // Offline fallback
        return caches.match('/clothes-erp-demo/');
      });
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

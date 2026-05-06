// Service Worker for Clothes ERP Demo - v6
// تحسين: مسارات نسبية + Network-First للملفات JS لتجنب مشاكل الأزرار في PWA
const CACHE_NAME = 'clothes-erp-v6';
const STATIC_ASSETS = [
  './css/style.css',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './js/modules/data.js',
  './js/modules/auth.js',
  './js/modules/theme.js',
  './js/modules/products.js',
  './js/modules/sales.js',
  './js/modules/inventory.js',
  './js/modules/purchases.js',
  './js/modules/suppliers.js',
  './js/modules/logs.js',
  './js/modules/profit.js',
  './js/modules/dashboard.js',
  './js/modules/app.js'
];

self.addEventListener('install', (e) => {
  console.log('[SW v6] Installing...');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[SW v6] Activating...');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  
  // تجاهل CDN
  if (url.includes('cdnjs') || url.includes('fonts.')) return;

  // Strategy by file type:
  // - JS files: Network-first (to always get latest code, fallback to cache if offline)
  // - CSS/images/other assets: Cache-first (faster load)
  if (url.match(/\.js(\?.*)?$/)) {
    // Network First for JS files
    e.respondWith(
      fetch(e.request)
        .then(response => {
          // Update cache with latest version
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, cloned));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  if (url.match(/\.(css|png|jpg|jpeg|gif|svg|ico|json)(\?.*)?$/)) {
    // Cache First for static assets
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
    return;
  }

  // لكل شيء آخر (HTML, navigation): Network ONLY
  // لا نخزن HTML أبداً لتجنب عرض نسخة قديمة
  e.respondWith(fetch(e.request));
});

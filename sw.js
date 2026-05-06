// Service Worker for Clothes ERP Demo - v3
// استراتيجية: تحميل الملفات المحلية فقط في مرحلة التثبيت
// لتجنب فشل التثبيت بسبب موارد CDN الخارجية (Font Awesome, Google Fonts)
const CACHE_NAME = 'clothes-erp-v3';
const LOCAL_ASSETS = [
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
  '/clothes-erp-demo/js/modules/app.js'
];

self.addEventListener('install', (e) => {
  console.log('[SW] Installing v3...');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // نخزن فقط الملفات المحلية - نتجاهل CDN لتجنب فشل التثبيت
      return cache.addAll(LOCAL_ASSETS).catch(err => {
        console.warn('[SW] Some local assets failed to cache:', err);
        // لا نرمي الخطأ - نستمر حتى لو فشل تخزين بعض الملفات
      });
    }).then(() => {
      console.log('[SW] Installed successfully');
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // استراتيجية خاصة لملفات CDN - نحاول من الشبكة أولاً ولا نخزن
  const requestUrl = e.request.url;

  // للملفات المحلية - من cache أولاً، ثم الشبكة
  if (!requestUrl.includes('cdnjs.cloudflare.com') && 
      !requestUrl.includes('fonts.googleapis.com') && 
      !requestUrl.includes('fonts.gstatic.com')) {
    
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(response => {
          // نخزن فقط الاستجابات الناجحة للملفات المحلية
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(e.request, clone);
            });
          }
          return response;
        }).catch(() => {
          // في وضع عدم الاتصال، نحاول إرجاع الصفحة الرئيسية
          return caches.match('/clothes-erp-demo/');
        });
      })
    );
  } else {
    // لموارد CDN - نحاول من الشبكة فقط، لا نخزنها
    e.respondWith(
      fetch(e.request).catch(() => {
        // فشل تحميل CDN - نرجع رداً فارغاً مقبولاً بدلاً من كسر الصفحة
        if (requestUrl.includes('font-awesome') || requestUrl.includes('fonts.g')) {
          return new Response('', { status: 200, headers: { 'Content-Type': 'text/css' } });
        }
        return new Response('', { status: 200 });
      })
    );
  }
});

self.addEventListener('activate', (e) => {
  console.log('[SW] Activating v3, cleaning old caches...');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      );
    }).then(() => {
      console.log('[SW] Activated successfully');
    })
  );
  self.clients.claim();
});

// public/sw.js
const CACHE_NAME = 'client-pwa-v1';
const CLIENT_PREFIX = '/clientdashboard'; // یا هر مسیری که client pages داره

const urlsToCache = [
  '/',
  '/clientdashboard',
  '/clientdashboard/calendar',
  '/clientdashboard/services',
  '/clientdashboard/bookingsubmit',
  '/clientdashboard/buysms',
  '/clientdashboard/pricingplan',
  '/clientdashboard/customers',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // فقط درخواست‌هایی که با مسیر client شروع می‌شن رو cache کنیم
  if (event.request.url.includes(CLIENT_PREFIX) || event.request.url.endsWith('/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
  } else {
    // بقیه صفحات (مثل admin) رو از کش رد کن
    event.respondWith(fetch(event.request));
  }
});
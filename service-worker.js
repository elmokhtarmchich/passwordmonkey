const CACHE_NAME = 'pm-cache-v16';
const ASSETS = [
  '/',
  'index.html',
  'about.html',
  'faq.html',
  'privacy.html',
  'donate.html',
  'password-security-guide.html',
  'style.css',
  'sidebar.css',
  'kilo-typography.css',
  'script.js',
  'manifest.json',
  'fonts/MatrixtypeDisplay-9MyE5.ttf',
  'images/nordvpn_logo.svg',
  'images/nordpass_logo.png',
  'images/google_logo.svg',
  'favicon_io/favicon.ico',
  'favicon_io/favicon-96x96.png',
  'favicon_io/apple-touch-icon.png',
  'favicon_io/android-chrome-192x192.png',
  'favicon_io/android-chrome-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                if (networkResponse.ok) {
                    const cacheCopy = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, cacheCopy);
                    });
                }
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
}); 
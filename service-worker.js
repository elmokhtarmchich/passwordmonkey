const CACHE_NAME = 'pm-cache-v11';
const ASSETS = [
  '/',
  'index.html',
  'about.html',
  'privacy.html',
  'donate.html',
  'password-security-guide.html',
  'style.css',
  'script.js',
  'manifest.json',
  'fonts/OpenSans.ttf',
  'images/nordvpn_logo.svg',
  'images/nordpass_logo.svg',
  'images/google_logo.svg',
  'favicon_io/favicon.ico',
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
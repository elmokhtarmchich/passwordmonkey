const CACHE_NAME = 'pm-cache-v17';
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

// Pages, everything under /news/, and the news manifest must never be served
// one-load-behind (the old cache-first strategy caused stale news lists that
// only a hard refresh could bypass). They get network-first with the cache
// kept as the offline fallback. Static assets keep cache-first + background
// revalidation (fast, rarely change).
function mustServeFresh(request) {
  if (request.mode === 'navigate') return true;
  const url = new URL(request.url);
  if (url.pathname === '/news/news-manifest.json') return true;
  return url.pathname.startsWith('/news/');
}

function stash(event, response) {
  if (response && response.ok && response.type === 'basic') {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => {
      cache.put(event.request, copy);
    });
  }
  return response;
}

function networkFirst(event) {
  return fetch(event.request)
    .then(response => {
      stash(event, response);
      return response;
    })
    .catch(() =>
      caches.match(event.request).then(cached => cached || Response.error())
    );
}

function cacheFirstWithUpdate(event) {
  return caches.match(event.request).then(cached => {
    const fetchPromise = fetch(event.request).then(response => {
      stash(event, response);
      return response;
    });
    return cached || fetchPromise;
  });
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (mustServeFresh(event.request)) {
    event.respondWith(networkFirst(event));
  } else {
    event.respondWith(cacheFirstWithUpdate(event));
  }
});

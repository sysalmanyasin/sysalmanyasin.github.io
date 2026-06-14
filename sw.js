const CACHE_NAME = 'fazaldins-workspace-v2.1';
const ASSETS = [
  'index.html',
  'manifest.json'
];

// Installs workspace core dependencies
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Clears obsolete architectural builds on asset refresh
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache-first runtime engine for workspace wrapper shell
self.addEventListener('fetch', event => {
  // Do not intercept mutations heading to external subdomains like Supabase/Dropbox
  if (!event.request.url.includes(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const cacheClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheClone));
        return networkResponse;
      });
    })
  );
});

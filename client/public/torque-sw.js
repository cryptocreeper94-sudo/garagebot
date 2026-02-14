const CACHE_NAME = 'torque-v1';
const TORQUE_STATIC_CACHE = 'torque-static-v1';
const TORQUE_DYNAMIC_CACHE = 'torque-dynamic-v1';

const MAX_DYNAMIC_CACHE_ITEMS = 50;

const TORQUE_STATIC_ASSETS = [
  '/torque-icon-192.png',
  '/torque-icon-512.png',
  '/torque-icon-maskable-512.png',
  '/torque-manifest.json',
];

function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => {
          trimCache(cacheName, maxItems);
        });
      }
    });
  });
}

self.addEventListener('install', (event) => {
  console.log('[TORQUE SW] Installing...');
  event.waitUntil(
    caches.open(TORQUE_STATIC_CACHE).then((cache) => {
      return cache.addAll(TORQUE_STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[TORQUE SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('torque-') && name !== CACHE_NAME && name !== TORQUE_STATIC_CACHE && name !== TORQUE_DYNAMIC_CACHE)
          .map((name) => {
            console.log('[TORQUE SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (!url.pathname.startsWith('/torque') && !url.pathname.startsWith('/torque-')) {
    return;
  }

  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseClone = response.clone();
        caches.open(TORQUE_DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, responseClone);
          trimCache(TORQUE_DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ITEMS);
        });

        return response;
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/torque');
        }
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

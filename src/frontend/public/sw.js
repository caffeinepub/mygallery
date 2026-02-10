// Service Worker for MyGallery PWA - Optimized caching strategy
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `mygallery-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `mygallery-runtime-${CACHE_VERSION}`;
const MAX_RUNTIME_CACHE_SIZE = 50;

// Minimal precache - only essential fallback
const PRECACHE_ASSETS = [
  '/index.html',
];

// Install event - precache fallback and skip waiting
self.addEventListener('install', (event) => {
  console.log('⚙️ Service Worker installing...');
  
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 Precaching fallback document');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('⚠️ Precache failed:', err);
      });
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🎯 Service Worker claiming clients');
      return self.clients.claim();
    })
  );
});

// Helper: Limit runtime cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Helper: Check if request should be cached
function shouldCache(request, response) {
  const url = new URL(request.url);
  
  // Don't cache cross-origin
  if (url.origin !== location.origin) return false;
  
  // Don't cache API/canister calls
  if (url.pathname.includes('/api/') || url.pathname.includes('canister')) return false;
  
  // Don't cache non-GET requests
  if (request.method !== 'GET') return false;
  
  // Don't cache unsuccessful responses
  if (!response || !response.ok) return false;
  
  // Don't cache opaque responses
  if (response.type === 'opaque') return false;
  
  return true;
}

// Fetch event - optimized caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip canister/API calls - always network
  if (url.pathname.includes('/api/') || url.pathname.includes('canister')) {
    return;
  }

  // Navigation requests: Network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
              limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Static assets with hash (immutable): Cache first
  if (url.pathname.match(/\.[a-f0-9]{8}\.(js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(request).then((response) => {
          if (shouldCache(request, response)) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Other assets: Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((response) => {
        if (shouldCache(request, response)) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
            limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
          });
        }
        return response;
      });
      
      return cachedResponse || fetchPromise;
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Skipping waiting phase');
    self.skipWaiting();
  }
});

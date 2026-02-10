// Service Worker for MyGallery PWA - Optimized for performance and installability
const CACHE_NAME = 'mygallery-v1';
const RUNTIME_CACHE = 'mygallery-runtime';
const MAX_RUNTIME_CACHE_SIZE = 50; // Limit runtime cache entries
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Minimal assets to cache on install - includes fallback document
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - precache essential assets including fallback
self.addEventListener('install', (event) => {
  console.log('⚙️ Service Worker installing...');
  
  // Skip waiting immediately to activate faster
  self.skipWaiting();
  
  // Cache essential assets including fallback document
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Precaching essential assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('⚠️ Precache failed, continuing anyway:', err);
      });
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim clients
      self.clients.claim().then(() => {
        console.log('🎯 Service Worker claimed clients');
      }),
    ])
  );
});

// Helper: Trim runtime cache to size limit
async function trimRuntimeCache() {
  const cache = await caches.open(RUNTIME_CACHE);
  const keys = await cache.keys();
  
  if (keys.length > MAX_RUNTIME_CACHE_SIZE) {
    const keysToDelete = keys.slice(0, keys.length - MAX_RUNTIME_CACHE_SIZE);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
    console.log(`🧹 Trimmed ${keysToDelete.length} entries from runtime cache`);
  }
}

// Helper: Check if response should be cached
function shouldCacheResponse(request, response) {
  // Only cache successful GET requests
  if (request.method !== 'GET' || !response.ok) {
    return false;
  }

  // Don't cache very large responses (> 5MB)
  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > 5 * 1024 * 1024) {
    return false;
  }

  // Cache static assets
  const url = new URL(request.url);
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i.test(url.pathname);
  
  return isStaticAsset;
}

// Fetch event - network first with reliable offline fallback and bounded caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip canister API calls - always fetch from network
  if (url.pathname.includes('/api/') || url.pathname.includes('canister')) {
    return;
  }

  // For navigation requests, use network first with fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
              // Trim cache in background
              trimRuntimeCache();
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached response or index.html
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Guaranteed fallback to precached index.html
            return caches.match('/index.html').then((indexResponse) => {
              if (indexResponse) {
                return indexResponse;
              }
              // Final fallback if precache failed
              return caches.match('/');
            });
          });
        })
    );
    return;
  }

  // For other requests, try network first with selective caching
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Selectively cache responses
        if (shouldCacheResponse(request, response)) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
            // Trim cache in background
            trimRuntimeCache();
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request);
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Skipping waiting phase');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🗑️ Clearing runtime cache');
    event.waitUntil(
      caches.delete(RUNTIME_CACHE).then(() => {
        console.log('✅ Runtime cache cleared');
      })
    );
  }
});

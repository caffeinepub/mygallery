// Service Worker for MyGallery PWA - Optimized for fast startup
const CACHE_NAME = 'mygallery-v1';
const RUNTIME_CACHE = 'mygallery-runtime';

// Minimal assets to cache on install - prioritize fast startup
const PRECACHE_ASSETS = [
  '/manifest.json',
];

// Install event - minimal precaching to avoid blocking
self.addEventListener('install', (event) => {
  // Skip waiting immediately to activate faster
  self.skipWaiting();
  
  // Cache minimal assets in background without blocking
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Precache failed, continuing anyway:', err);
      });
    })
  );
});

// Activate event - clean up old caches quickly
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - network first for fast loading, cache as fallback
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

  // For navigation requests, use network first for fast loading
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses in background
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache only if network fails
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For other requests, try network first for fresh content
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses in background
        if (response.ok && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache only if network fails
        return caches.match(request);
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

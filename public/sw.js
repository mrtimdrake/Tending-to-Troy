/**
 * Tending to Troy — Service Worker
 *
 * Minimal stub that satisfies PWA installability (so the app can be
 * installed to the home screen and launch standalone).
 *
 * The app is online-only by product decision; there is no offline cache
 * or background sync. If offline support is ever revived (end of roadmap,
 * subject to go/no-go), the caching strategy would be added here.
 */

const CACHE_NAME = 'tending-to-troy-v1'

self.addEventListener('install', (event) => {
  // Activate immediately — don't wait for existing clients to close
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

// Pass-through fetch — no caching in Phase 1
self.addEventListener('fetch', () => {})

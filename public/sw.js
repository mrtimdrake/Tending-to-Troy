/**
 * Tending to Troy — Service Worker
 *
 * Phase 1: minimal stub that satisfies PWA installability requirements.
 *
 * Phase 3a will replace this with a full offline-queue implementation:
 *   - Cache-first strategy for static assets
 *   - Network-first strategy for API routes
 *   - Background sync for queued offline edits
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

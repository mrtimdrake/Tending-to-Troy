'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        // App still works without the service worker, but log so a broken
        // registration (e.g. wrong MIME type) is diagnosable.
        console.error('Service worker registration failed:', err)
      })
    }
  }, [])

  return null
}

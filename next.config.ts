import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  headers: async () => [
    {
      // Service workers must not be cached by the browser or CDN.
      // A stale SW prevents updates from propagating.
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
    {
      source: '/manifest.json',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600',
        },
      ],
    },
  ],
}

export default nextConfig

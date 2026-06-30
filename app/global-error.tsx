'use client'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error boundary:', error)
  }, [error])

  return (
    <html lang="en-GB">
      <body
        style={{
          minHeight: '100vh',
          margin: 0,
          background: '#F5E8A8',
          color: '#102A43',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '24rem' }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#5B6C80', marginBottom: '1.5rem' }}>
            Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#102A43',
              color: '#FFFDF6',
              border: 'none',
              borderRadius: '14px',
              padding: '12px 20px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}

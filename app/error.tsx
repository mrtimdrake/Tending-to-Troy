'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <h1 className="font-heading text-title text-navy mb-2">
          Something went wrong
        </h1>
        <p className="font-body text-body text-slate mb-6">
          That wasn&apos;t meant to happen. Try again — your tasks are safe.
        </p>
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  )
}

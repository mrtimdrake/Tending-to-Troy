import { Loader2 } from 'lucide-react'

// Calm full-screen loading state used by route-level loading.tsx files.
export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <Loader2
        size={24}
        strokeWidth={1.75}
        className="animate-spin text-brass"
        aria-label="Loading"
      />
    </div>
  )
}

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <h1 className="font-heading text-title text-navy mb-2">
          Nothing here
        </h1>
        <p className="font-body text-body text-slate mb-6">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center justify-center rounded-button px-5 min-h-[44px] bg-navy text-ivory font-ui font-medium text-small hover:bg-navy/90 transition-colors duration-button"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

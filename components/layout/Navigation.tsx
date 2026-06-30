import Link from 'next/link'
import { Settings } from 'lucide-react'

export function Navigation() {
  return (
    <header
      className="sticky top-0 z-10 bg-ivory border-b border-navy/10"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto max-w-content px-4 flex items-start justify-between py-3">
        <div>
          <p className="font-heading text-sm font-semibold text-navy leading-tight">
            Tending to Troy
          </p>
          <p className="font-body text-xs text-slate italic mt-0.5">
            Care for our home.
          </p>
        </div>
        <div className="flex items-center -mr-1">
          <Link
            href="/settings"
            aria-label="Settings"
            className="flex items-center justify-center w-11 h-11 rounded-lg text-navy hover:bg-navy/5 transition-colors duration-[120ms]"
          >
            <Settings size={18} strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </header>
  )
}

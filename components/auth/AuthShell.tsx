import type { ReactNode } from 'react'

interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 bg-paper">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-display text-navy">
            Tending to Troy
          </h1>
          <p className="mt-1 font-ui text-small text-slate">
            Care for our home.
          </p>
        </div>

        <div
          className="rounded-card bg-ivory p-8"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <h2 className="mb-1 font-heading text-title text-navy">{title}</h2>
          {subtitle && (
            <p className="mb-6 font-ui text-small text-slate">{subtitle}</p>
          )}
          {!subtitle && <div className="mb-6" />}
          {children}
        </div>
      </div>
    </main>
  )
}

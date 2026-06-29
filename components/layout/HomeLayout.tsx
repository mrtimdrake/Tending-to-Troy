import { Navigation } from './Navigation'

export function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <Navigation />
      <main className="mx-auto max-w-content px-4 pt-6 pb-16">
        {children}
      </main>
    </div>
  )
}

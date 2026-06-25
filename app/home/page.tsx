import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { InvitationPanel } from './InvitationPanel'

export default async function HomePage() {
  const supabase = await createServerClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: currentUser } = await admin
    .from('users')
    .select('household_id, name')
    .eq('id', user.id)
    .single()

  if (!currentUser) redirect('/auth/sign-in')

  // Check if the second user has joined
  const { count: memberCount } = await admin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', currentUser.household_id)

  const { data: household } = await admin
    .from('households')
    .select('invitation_token, invitation_used')
    .eq('id', currentUser.household_id)
    .single()

  const householdFull = (memberCount ?? 0) >= 2

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-paper">
      <div className="w-full max-w-content">
        <div className="mb-8">
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
          <p className="font-body text-body text-navy mb-2">
            Welcome, {currentUser.name}.
          </p>
          <p className="font-ui text-small text-slate">
            {householdFull
              ? 'Your home is ready. Tasks are coming in Phase 2.'
              : 'Your home is set up. Invite your partner to join.'}
          </p>
        </div>

        {!householdFull && household && (
          <div className="mt-4">
            <InvitationPanel
              token={household.invitation_token ?? ''}
              invitationUsed={household.invitation_used}
            />
          </div>
        )}
      </div>
    </main>
  )
}

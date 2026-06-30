import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SettingsView } from './SettingsView'

export default async function SettingsPage() {
  const supabase = await createServerClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: currentUser } = await admin
    .from('users')
    .select('household_id, name, email')
    .eq('id', user.id)
    .single()

  if (!currentUser) redirect('/auth/sign-in')

  const { count: memberCount } = await admin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', currentUser.household_id)

  const { data: household } = await admin
    .from('households')
    .select('name, invitation_token, invitation_used')
    .eq('id', currentUser.household_id)
    .single()

  const householdFull = (memberCount ?? 0) >= 2
  const invitation =
    !householdFull && household
      ? {
          token: household.invitation_token ?? '',
          invitationUsed: household.invitation_used,
        }
      : null

  return (
    <SettingsView
      name={currentUser.name}
      email={currentUser.email}
      householdName={household?.name ?? 'Our Home'}
      invitation={invitation}
    />
  )
}

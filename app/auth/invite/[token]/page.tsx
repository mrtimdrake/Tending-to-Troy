import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth/AuthShell'
import { InviteForm } from './InviteForm'
import { createAdminClient } from '@/lib/supabase/admin'

interface Props {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params

  // Validate the token server-side before rendering the form
  const admin = createAdminClient()
  const { data: household } = await admin
    .from('households')
    .select('invitation_token, invitation_used')
    .eq('invitation_token', token)
    .single()

  if (!household) {
    redirect('/auth/invite/invalid')
  }

  if (household.invitation_used) {
    redirect('/auth/invite/used')
  }

  return (
    <AuthShell
      title="Join the household"
      subtitle="You've been invited. Create your account to get started."
    >
      <InviteForm token={token} />
    </AuthShell>
  )
}

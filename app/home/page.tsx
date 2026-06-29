import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PrioritySection } from '@/components/home/PrioritySection'
import { InvitationPanel } from './InvitationPanel'
import { placeholderTasks, tasksByPriority } from '@/lib/placeholder/tasks'

const PRIORITIES = [1, 2, 3, 4] as const

export default async function HomePage() {
  const supabase = await createServerClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: currentUser } = await admin
    .from('users')
    .select('household_id, name')
    .eq('id', user.id)
    .single()

  if (!currentUser) redirect('/auth/sign-in')

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
    <HomeLayout>
      {!householdFull && household && (
        <div className="mb-6">
          <InvitationPanel
            token={household.invitation_token ?? ''}
            invitationUsed={household.invitation_used}
          />
        </div>
      )}

      <div className="flex flex-col gap-5">
        {PRIORITIES.map((priority) => (
          <PrioritySection
            key={priority}
            priority={priority}
            tasks={tasksByPriority(priority)}
          />
        ))}
      </div>
    </HomeLayout>
  )
}

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getTaskById } from '@/features/tasks/queries'
import { TaskDetail } from './TaskDetail'

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const task = await getTaskById(id)
  // RLS makes "not found" and "not in my household" indistinguishable —
  // either way, send the user home.
  if (!task) redirect('/home')

  return <TaskDetail task={task} />
}

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { HomeView } from '@/components/home/HomeView'
import { getActiveTasks } from '@/features/tasks/queries'

export default async function HomePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const tasks = await getActiveTasks()

  return <HomeView initialTasks={tasks} />
}

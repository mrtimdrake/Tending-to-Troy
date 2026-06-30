import { createServerClient } from '@/lib/supabase/server'
import { mapTaskRow, sortTasks } from './mapping'
import type { Task } from './types'

// All active tasks for the user's household, sorted for display.
// RLS scopes the result to the caller's household automatically.
export async function getActiveTasks(): Promise<Task[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'active')

  // Distinguish a real failure from an empty household: throw on error so
  // the error boundary shows a clear message instead of a misleading
  // "no tasks" home screen.
  if (error) {
    console.error('getActiveTasks failed:', error)
    throw new Error('Could not load tasks.')
  }
  if (!data) return []

  return sortTasks(data.map((row) => mapTaskRow(row)))
}

// A single task by id, or null if it does not exist / is not in the
// caller's household (RLS makes those indistinguishable, by design).
export async function getTaskById(id: string): Promise<Task | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  // A real query error is different from "no such row": log the former,
  // treat a missing row as not-found (caller redirects home).
  if (error) {
    console.error('getTaskById failed:', error)
    throw new Error('Could not load the task.')
  }
  if (!data) return null

  return mapTaskRow(data)
}

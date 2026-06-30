import { createAdminClient } from '@/lib/supabase/admin'

// Appends a task_history entry. The task_history table has no client
// insert policy (RLS migration 002) — history is written server-side
// with the admin client so the trail cannot be tampered with from the
// browser. This is the safety net for last-write-wins (see PRD).
//
// History writes are best-effort: a failure here must never roll back
// the user's actual edit, so callers do not await a thrown error.
export async function recordHistory(
  taskId: string,
  changedBy: string,
  summary: string
): Promise<void> {
  try {
    const admin = createAdminClient()
    const { error } = await admin.from('task_history').insert({
      task_id: taskId,
      changed_by: changedBy,
      change_summary: summary,
    })
    if (error) console.error('recordHistory failed:', error)
  } catch (err) {
    // Best-effort: never let a history failure roll back the user's edit.
    console.error('recordHistory threw:', err)
  }
}

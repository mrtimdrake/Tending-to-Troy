'use server'

import { createServerClient } from '@/lib/supabase/server'
import { mapTaskRow } from './mapping'
import { recordHistory } from './history'
import type { Task, CreateTaskInput, UpdateTaskInput, TaskOwner, TaskLocation } from './types'
import type { Database } from '@/types/database'

type TaskUpdateRow = Database['public']['Tables']['tasks']['Update']

type ActionResult = { task: Task } | { error: string }

const OWNER_LABEL: Record<TaskOwner, string> = {
  tim: 'Tim',
  wife: 'Wife',
  anyone: 'Anyone',
}
const LOCATION_LABEL: Record<TaskLocation, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
}

// Resolves the authenticated caller and their household. Every action
// starts here; null means not signed in / no user record.
async function getContext() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: row } = await supabase
    .from('users')
    .select('household_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!row) return null
  return { supabase, userId: user.id, householdId: row.household_id }
}

// ============================================================
// Create
// ============================================================
export async function createTask(input: CreateTaskInput): Promise<ActionResult> {
  const ctx = await getContext()
  if (!ctx) return { error: 'Not signed in.' }

  const title = input.title.trim()
  if (!title) return { error: 'A title is required.' }

  const { data, error } = await ctx.supabase
    .from('tasks')
    .insert({
      household_id: ctx.householdId,
      title,
      priority: input.priority,
      owner: input.owner,
      location: input.location,
      status: 'active',
      description: input.description?.trim() || null,
      notes: input.notes?.trim() || null,
      // Leave manual_order at its default (0). New tasks sort to the top of
      // their group via the newest-first tiebreaker in sortTasks until
      // explicit drag ordering arrives in Milestone 3b.
      created_by: ctx.userId,
    })
    .select('*')
    .single()

  if (error || !data) return { error: 'Could not create the task.' }

  await recordHistory(data.id, ctx.userId, 'Created')
  return { task: mapTaskRow(data) }
}

// ============================================================
// Update (core fields, auto-saved)
// ============================================================
export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<ActionResult> {
  const ctx = await getContext()
  if (!ctx) return { error: 'Not signed in.' }

  const patch: TaskUpdateRow = {}
  if (input.title !== undefined) {
    const t = input.title.trim()
    if (!t) return { error: 'A title is required.' }
    patch.title = t
  }
  if (input.priority !== undefined) patch.priority = input.priority
  if (input.owner !== undefined) patch.owner = input.owner
  if (input.location !== undefined) patch.location = input.location
  if (input.description !== undefined) patch.description = input.description
  if (input.notes !== undefined) patch.notes = input.notes

  if (Object.keys(patch).length === 0) {
    return { error: 'Nothing to update.' }
  }
  patch.updated_at = new Date().toISOString()

  const { data, error } = await ctx.supabase
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) return { error: 'Could not save your change.' }

  await recordHistory(data.id, ctx.userId, summariseUpdate(input))
  return { task: mapTaskRow(data) }
}

function summariseUpdate(input: UpdateTaskInput): string {
  const parts: string[] = []
  if (input.title !== undefined) parts.push('Title edited')
  if (input.priority !== undefined) parts.push(`Priority set to ${input.priority}`)
  if (input.owner !== undefined) parts.push(`Owner set to ${OWNER_LABEL[input.owner]}`)
  if (input.location !== undefined) parts.push(`Location set to ${LOCATION_LABEL[input.location]}`)
  if (input.description !== undefined) parts.push('Description edited')
  if (input.notes !== undefined) parts.push('Notes edited')
  return parts.join(', ') || 'Edited'
}

// ============================================================
// Archive / Restore / Delete
// ============================================================
export async function archiveTask(id: string): Promise<ActionResult> {
  return setStatus(id, 'archived', 'Archived', { archived_at: new Date().toISOString() })
}

export async function restoreTask(id: string): Promise<ActionResult> {
  return setStatus(id, 'active', 'Restored', { archived_at: null })
}

export async function deleteTask(id: string): Promise<ActionResult> {
  // Soft delete — never a hard delete from the client (PRD).
  return setStatus(id, 'deleted', 'Deleted', {})
}

async function setStatus(
  id: string,
  status: 'active' | 'archived' | 'deleted',
  summary: string,
  extra: TaskUpdateRow
): Promise<ActionResult> {
  const ctx = await getContext()
  if (!ctx) return { error: 'Not signed in.' }

  const { data, error } = await ctx.supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString(), ...extra })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) return { error: 'Could not update the task.' }

  await recordHistory(data.id, ctx.userId, summary)
  return { task: mapTaskRow(data) }
}

// ============================================================
// Pin / Unpin
// ============================================================
export async function setPinned(
  id: string,
  pinned: boolean
): Promise<ActionResult> {
  const ctx = await getContext()
  if (!ctx) return { error: 'Not signed in.' }

  const { data, error } = await ctx.supabase
    .from('tasks')
    .update({ is_pinned: pinned, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) return { error: 'Could not update the task.' }

  await recordHistory(data.id, ctx.userId, pinned ? 'Pinned' : 'Unpinned')
  return { task: mapTaskRow(data) }
}

// ============================================================
// Reorder (manual drag order within a priority group)
// Persists explicit spaced manual_order values for the supplied ids,
// in the given order: 10, 20, 30, … RLS scopes writes to the household.
// ============================================================
export async function reorderTasks(
  orderedIds: string[]
): Promise<{ ok: true } | { error: string }> {
  const ctx = await getContext()
  if (!ctx) return { error: 'Not signed in.' }
  if (orderedIds.length === 0) return { ok: true }

  const now = new Date().toISOString()
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      ctx.supabase
        .from('tasks')
        .update({ manual_order: (index + 1) * 10, updated_at: now })
        .eq('id', id)
    )
  )

  if (results.some((r) => r.error)) {
    console.error('reorderTasks: one or more updates failed')
    return { error: 'Could not save the new order.' }
  }

  // One history entry on the first task is enough to record the reorder.
  await recordHistory(orderedIds[0], ctx.userId, 'Reordered')
  return { ok: true }
}

import type { Database } from '@/types/database'
import type { Task, TaskOwner, TaskLocation, TaskStatus, TaskPriority } from './types'

type TaskRow = Database['public']['Tables']['tasks']['Row']

// Single source of truth for turning a raw DB row into the view-model.
// `hasShopping` is supplied by the caller (a separate count) — defaults
// to false until Milestone 4 wires shopping items.
export function mapTaskRow(row: TaskRow, hasShopping = false): Task {
  return {
    id: row.id,
    title: row.title,
    priority: clampPriority(row.priority),
    manualOrder: row.manual_order,
    owner: row.owner as TaskOwner,
    location: row.location as TaskLocation,
    status: row.status as TaskStatus,
    description: row.description,
    notes: row.notes,
    isPinned: row.is_pinned,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
    hasShopping,
  }
}

function clampPriority(value: number): TaskPriority {
  if (value === 1 || value === 2 || value === 3 || value === 4) return value
  return 1
}

// Pinned first, then by manual order, then by creation time as a stable
// tiebreaker. Used wherever a priority group is displayed.
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    if (a.manualOrder !== b.manualOrder) return a.manualOrder - b.manualOrder
    // Newest first on ties (e.g. all new tasks at manual_order 0).
    return b.createdAt.localeCompare(a.createdAt)
  })
}

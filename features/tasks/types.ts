import type { TaskOwner, TaskLocation, TaskStatus, TaskPriority } from '@/types/database'

export type { TaskOwner, TaskLocation, TaskStatus, TaskPriority }

// Clean view-model used by components. Decoupled from the raw DB row so
// that storage shape and UI shape can evolve independently.
export type Task = {
  id: string
  title: string
  priority: TaskPriority
  manualOrder: number
  owner: TaskOwner
  location: TaskLocation
  status: TaskStatus
  description: string | null
  notes: string | null
  isPinned: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  completedAt: string | null
  archivedAt: string | null
  // Populated in Milestone 4 once shopping items exist. False for now so
  // the card's shopping indicator stays dormant until then.
  hasShopping: boolean
}

// Fields a user can set when creating a task.
export type CreateTaskInput = {
  title: string
  priority: TaskPriority
  owner: TaskOwner
  location: TaskLocation
  description?: string | null
  notes?: string | null
}

// Fields a user can change on an existing task in this milestone.
export type UpdateTaskInput = Partial<{
  title: string
  priority: TaskPriority
  owner: TaskOwner
  location: TaskLocation
  description: string | null
  notes: string | null
}>

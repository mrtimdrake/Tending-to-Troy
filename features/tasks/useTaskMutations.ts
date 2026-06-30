'use client'
import { useState, useCallback } from 'react'
import { createTask, archiveTask, deleteTask, setPinned, reorderTasks } from './actions'
import type { Task, CreateTaskInput } from './types'

type Mutators = {
  upsertTask: (task: Task) => void
  removeTask: (id: string) => void
  replaceTask: (tempId: string, task: Task) => void
  applyOrder: (orderedIds: string[]) => void
}

// Wraps the server actions with optimistic updates. This is the single
// place components call to mutate the home list. (If offline is ever
// revived, queueing would slot in here — see Milestone 3 plan.)
export function useTaskMutations({ upsertTask, removeTask, replaceTask, applyOrder }: Mutators) {
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(
    async (input: CreateTaskInput) => {
      setError(null)
      const tempId = `temp-${crypto.randomUUID()}`
      const now = new Date().toISOString()

      const optimistic: Task = {
        id: tempId,
        title: input.title.trim(),
        priority: input.priority,
        manualOrder: 0,
        owner: input.owner,
        location: input.location,
        status: 'active',
        description: input.description?.trim() || null,
        notes: input.notes?.trim() || null,
        isPinned: false,
        createdBy: '',
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        archivedAt: null,
        hasShopping: false,
      }

      upsertTask(optimistic)
      const result = await createTask(input)
      if ('error' in result) {
        removeTask(tempId)
        setError(result.error)
        return false
      }
      replaceTask(tempId, result.task)
      return true
    },
    [upsertTask, removeTask, replaceTask]
  )

  const archive = useCallback(
    async (task: Task) => {
      setError(null)
      removeTask(task.id) // optimistic
      const result = await archiveTask(task.id)
      if ('error' in result) {
        upsertTask(task) // rollback
        setError(result.error)
        return false
      }
      return true
    },
    [removeTask, upsertTask]
  )

  const remove = useCallback(
    async (task: Task) => {
      setError(null)
      removeTask(task.id) // optimistic
      const result = await deleteTask(task.id)
      if ('error' in result) {
        upsertTask(task) // rollback
        setError(result.error)
        return false
      }
      return true
    },
    [removeTask, upsertTask]
  )

  const togglePin = useCallback(
    async (task: Task) => {
      setError(null)
      const next = { ...task, isPinned: !task.isPinned }
      upsertTask(next) // optimistic — re-sorts to/from the pinned block
      const result = await setPinned(task.id, next.isPinned)
      if ('error' in result) {
        upsertTask(task) // rollback
        setError(result.error)
        return false
      }
      return true
    },
    [upsertTask]
  )

  const reorder = useCallback(
    async (orderedIds: string[], prevOrderedIds: string[]) => {
      setError(null)
      applyOrder(orderedIds) // optimistic
      const result = await reorderTasks(orderedIds)
      if ('error' in result) {
        applyOrder(prevOrderedIds) // rollback
        setError(result.error)
        return false
      }
      return true
    },
    [applyOrder]
  )

  return { create, archive, remove, togglePin, reorder, error, clearError: () => setError(null) }
}

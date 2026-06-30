'use client'
import { useEffect, useState, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { mapTaskRow, sortTasks } from './mapping'
import type { Task } from './types'
import type { Database } from '@/types/database'

type TaskRow = Database['public']['Tables']['tasks']['Row']

// Holds the live task list for the home screen. Seeded from the server
// render, then kept in sync via Supabase Realtime. Local mutators let the
// mutation layer apply optimistic updates that survive the Realtime echo.
export function useTasks(initial: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initial)

  // Insert or replace a task locally (optimistic create/update).
  const upsertTask = useCallback((task: Task) => {
    setTasks((prev) => {
      const next = prev.some((t) => t.id === task.id)
        ? prev.map((t) => (t.id === task.id ? task : t))
        : [...prev, task]
      return sortTasks(next.filter((t) => t.status === 'active'))
    })
  }, [])

  // Remove a task locally (optimistic archive/delete, or rollback).
  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Replace a temporary optimistic id with the confirmed row.
  const replaceTask = useCallback((tempId: string, task: Task) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === tempId ? task : t))
      return sortTasks(next.filter((t) => t.status === 'active'))
    })
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel | null = null
    let active = true

    const handleChange = (
      payload: { eventType: string; new: unknown; old: unknown }
    ) => {
      if (payload.eventType === 'DELETE') {
        const oldId = (payload.old as { id?: string }).id
        if (oldId) removeTask(oldId)
        return
      }
      const mapped = mapTaskRow(payload.new as TaskRow)
      if (mapped.status === 'active') {
        upsertTask(mapped)
      } else {
        // Moved to archived/deleted/completed — drop from the active view.
        removeTask(mapped.id)
      }
    }

    ;(async () => {
      // Realtime must be authenticated with the user's token, otherwise RLS
      // (which needs auth.uid() to resolve the household) filters out every
      // change and nothing is delivered.
      const { data } = await supabase.auth.getSession()
      if (!active) return
      if (data.session) {
        supabase.realtime.setAuth(data.session.access_token)
      }
      channel = supabase
        .channel('tasks-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          handleChange
        )
        .subscribe()
    })()

    return () => {
      active = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [upsertTask, removeTask])

  return { tasks, upsertTask, removeTask, replaceTask }
}

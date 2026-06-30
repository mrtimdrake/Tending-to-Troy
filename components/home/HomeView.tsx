'use client'
import { useState } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { PrioritySection } from './PrioritySection'
import { NewTaskForm } from './NewTaskForm'
import { AddTaskFab } from './AddTaskFab'
import { useTasks } from '@/features/tasks/useTasks'
import { useTaskMutations } from '@/features/tasks/useTaskMutations'
import type { Task, TaskPriority } from '@/features/tasks/types'

type Props = {
  initialTasks: Task[]
}

const PRIORITIES: TaskPriority[] = [1, 2, 3, 4]

export function HomeView({ initialTasks }: Props) {
  const { tasks, upsertTask, removeTask, replaceTask } = useTasks(initialTasks)
  const { create, error } = useTaskMutations({ upsertTask, removeTask, replaceTask })
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="min-h-screen bg-paper">
      <Navigation />

      <main className="mx-auto max-w-content px-4 pt-6 pb-24">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center text-center px-6 pt-20">
            <p className="font-body text-body text-navy mb-1">
              Your home is ready.
            </p>
            <p className="font-ui text-small text-slate">
              Add your first task with the <span className="text-brass font-medium">+</span> button.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {PRIORITIES.map((priority) => (
              <PrioritySection
                key={priority}
                priority={priority}
                tasks={tasks.filter((t) => t.priority === priority)}
              />
            ))}
          </div>
        )}
      </main>

      <AddTaskFab onClick={() => setFormOpen(true)} />

      <NewTaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreate={create}
        error={error}
      />
    </div>
  )
}

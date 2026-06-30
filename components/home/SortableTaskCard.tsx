'use client'
import { useEffect, useRef } from 'react'
import { useSortable, defaultAnimateLayoutChanges, type AnimateLayoutChanges } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/features/tasks/types'
import { TaskCard } from './TaskCard'

type Props = {
  task: Task
  onTogglePin?: (task: Task) => void
}

// Always animate layout changes (so a pinned card slides to the top, not
// just during drags).
const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true })

export function SortableTaskCard({ task, onTogglePin }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, animateLayoutChanges })

  // Suppress the click that fires immediately after a drop, so a drag
  // never navigates into the task. Normal taps (well after any drag) pass.
  const lastDragEnd = useRef(0)
  const wasDragging = useRef(false)
  useEffect(() => {
    if (isDragging) {
      wasDragging.current = true
    } else if (wasDragging.current) {
      wasDragging.current = false
      lastDragEnd.current = Date.now()
    }
  }, [isDragging])

  return (
    <div
      ref={setNodeRef}
      onClickCapture={(e) => {
        if (Date.now() - lastDragEnd.current < 250) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.9 : 1,
        boxShadow: isDragging ? 'var(--shadow-lift)' : undefined,
        borderRadius: 'var(--radius-card)',
        touchAction: 'manipulation',
      }}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onTogglePin={onTogglePin} />
    </div>
  )
}

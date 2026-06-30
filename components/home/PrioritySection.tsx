'use client'
import { useRef, useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Task } from '@/features/tasks/types'
import { TaskCard } from './TaskCard'
import { SortableTaskCard } from './SortableTaskCard'
import { useSectionState } from '@/hooks/useSectionState'

type Props = {
  priority: 1 | 2 | 3 | 4
  tasks: Task[]
  onTogglePin?: (task: Task) => void
  onReorder?: (orderedIds: string[], prevOrderedIds: string[]) => void
}

export function PrioritySection({ priority, tasks, onTogglePin, onReorder }: Props) {
  const [isOpen, toggle] = useSectionState(priority)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  // Drag is a client-only enhancement. Render plain cards during SSR and
  // the first client render (matching the server) to avoid a hydration
  // mismatch from dnd-kit's accessibility nodes, then enable drag.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [tasks])

  // Distance (desktop) / long-press (mobile) activation so a tap still
  // navigates and the list still scrolls.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = tasks.map((t) => t.id)
    const from = ids.indexOf(active.id as string)
    const to = ids.indexOf(over.id as string)
    if (from === -1 || to === -1) return
    onReorder?.(arrayMove(ids, from, to), ids)
  }

  return (
    <section>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-2 min-h-[44px] select-none"
        aria-expanded={isOpen}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <span className="font-body italic text-sm text-navy/80">
          Priority {priority}
        </span>
        <div className="flex items-center gap-2 text-slate">
          <span className="font-ui text-label text-slate/70">
            ({tasks.length})
          </span>
          <ChevronRight
            size={14}
            strokeWidth={2}
            className="transition-transform"
            style={{
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transitionDuration: 'var(--duration-pin)',
              transitionTimingFunction: 'var(--easing-default)',
            }}
          />
        </div>
      </button>

      <div
        style={{
          maxHeight: isOpen ? contentHeight || 'none' : 0,
          overflow: 'hidden',
          transition: `max-height var(--duration-card) var(--easing-default)`,
        }}
      >
        <div ref={contentRef} className="flex flex-col gap-2.5 pb-1">
          {tasks.length === 0 ? (
            <p className="font-body italic text-sm text-slate/70 px-1 py-2">
              Nothing here yet.
            </p>
          ) : !mounted ? (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onTogglePin={onTogglePin} />
            ))
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {tasks.map((task) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    onTogglePin={onTogglePin}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </section>
  )
}

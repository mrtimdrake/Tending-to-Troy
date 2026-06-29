'use client'
import { useRef, useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { PlaceholderTask } from '@/lib/placeholder/tasks'
import { TaskCard } from './TaskCard'
import { useSectionState } from '@/hooks/useSectionState'

type Props = {
  priority: 1 | 2 | 3 | 4
  tasks: PlaceholderTask[]
}

export function PrioritySection({ priority, tasks }: Props) {
  const [isOpen, toggle] = useSectionState(priority)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [tasks])

  return (
    <section>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-2 min-h-[44px] -webkit-tap-highlight-transparent select-none"
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
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </div>
    </section>
  )
}

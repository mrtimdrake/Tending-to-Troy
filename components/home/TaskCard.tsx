'use client'
import Link from 'next/link'
import type { Task } from '@/features/tasks/types'
import { LocationBadge, OwnerBadge } from './TaskCardBadge'
import { BrassPin } from './BrassPin'
import { ShoppingIndicator } from './ShoppingIndicator'

type Props = {
  task: Task
  onTogglePin?: (task: Task) => void
}

export function TaskCard({ task, onTogglePin }: Props) {
  return (
    <Link
      href={`/task/${task.id}`}
      className="relative block bg-ivory rounded-card px-4 py-3.5 select-none"
      style={{
        boxShadow: 'var(--shadow-card)',
        WebkitTapHighlightColor: 'transparent',
        transition: `box-shadow var(--duration-card) var(--easing-default), transform var(--duration-button) var(--easing-default)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-lift)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
      }}
    >
      {onTogglePin && (
        <button
          aria-label={task.isPinned ? 'Unpin task' : 'Pin task'}
          aria-pressed={task.isPinned}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onTogglePin(task)
          }}
          className="absolute top-1 right-1 flex items-center justify-center w-11 h-11 rounded-lg"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <BrassPin pinned={task.isPinned} />
        </button>
      )}

      <p className="font-body text-body text-navy leading-snug mb-2.5 pr-9">
        {task.title}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap">
        <LocationBadge location={task.location} />
        <OwnerBadge owner={task.owner} />
        {task.hasShopping && <ShoppingIndicator />}
      </div>
    </Link>
  )
}

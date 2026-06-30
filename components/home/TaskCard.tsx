'use client'
import Link from 'next/link'
import type { Task } from '@/features/tasks/types'
import { LocationBadge, OwnerBadge } from './TaskCardBadge'
import { PinIndicator } from './PinIndicator'
import { ShoppingIndicator } from './ShoppingIndicator'

type Props = {
  task: Task
}

export function TaskCard({ task }: Props) {
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
      {task.isPinned && <PinIndicator />}

      <p
        className="font-body text-body text-navy leading-snug mb-2.5"
        style={{ paddingRight: task.isPinned ? '1.25rem' : undefined }}
      >
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

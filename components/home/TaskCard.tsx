import { PlaceholderTask } from '@/lib/placeholder/tasks'
import { LocationBadge, OwnerBadge } from './TaskCardBadge'
import { PinIndicator } from './PinIndicator'
import { ShoppingIndicator } from './ShoppingIndicator'

type Props = {
  task: PlaceholderTask
}

export function TaskCard({ task }: Props) {
  return (
    <div
      className="relative bg-ivory rounded-card px-4 py-3.5 cursor-pointer select-none"
      style={{
        boxShadow: 'var(--shadow-card)',
        WebkitTapHighlightColor: 'transparent',
        transition: `box-shadow var(--duration-card) var(--easing-default), transform var(--duration-button) var(--easing-default)`,
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow =
          'var(--shadow-lift)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow =
          'var(--shadow-card)'
      }}
      role="button"
      tabIndex={0}
    >
      {task.pinned && <PinIndicator />}

      <p
        className="font-body text-body text-navy leading-snug mb-2.5"
        style={{ paddingRight: task.pinned ? '1.25rem' : undefined }}
      >
        {task.title}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap">
        <LocationBadge location={task.location} />
        <OwnerBadge owner={task.owner} />
        {task.has_shopping && <ShoppingIndicator />}
      </div>
    </div>
  )
}

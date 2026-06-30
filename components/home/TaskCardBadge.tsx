import type { TaskLocation, TaskOwner } from '@/features/tasks/types'

const badgeBase = 'font-ui text-label px-2.5 py-1 rounded-full'

export function LocationBadge({ location }: { location: TaskLocation }) {
  const style =
    location === 'outdoor'
      ? { background: 'rgba(126,159,121,0.18)', color: '#7E9F79' }
      : { background: 'rgba(91,108,128,0.12)', color: '#5B6C80' }

  return (
    <span className={badgeBase} style={style}>
      {location === 'outdoor' ? 'Outdoor' : 'Indoor'}
    </span>
  )
}

const OWNER_STYLE: Record<TaskOwner, { background: string; color: string }> = {
  tim:    { background: 'rgba(201,122,82,0.13)', color: '#C97A52' },
  wife:   { background: 'rgba(180,138,61,0.16)', color: '#B48A3D' },
  anyone: { background: 'rgba(16,42,67,0.09)',   color: '#102A43' },
}
const OWNER_LABEL: Record<TaskOwner, string> = {
  tim: 'Tim',
  wife: 'Wife',
  anyone: 'Anyone',
}

export function OwnerBadge({ owner }: { owner: TaskOwner }) {
  return (
    <span className={badgeBase} style={OWNER_STYLE[owner]}>
      {OWNER_LABEL[owner]}
    </span>
  )
}

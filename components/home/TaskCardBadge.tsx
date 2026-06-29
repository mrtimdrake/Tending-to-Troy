type Location = 'indoor' | 'outdoor'
type Owner = 'Tim' | 'Wife' | 'Anyone'

const badgeBase = 'font-ui text-label px-2.5 py-1 rounded-full'

export function LocationBadge({ location }: { location: Location }) {
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

export function OwnerBadge({ owner }: { owner: Owner }) {
  const style = {
    Tim:    { background: 'rgba(201,122,82,0.13)', color: '#C97A52' },
    Wife:   { background: 'rgba(180,138,61,0.16)', color: '#B48A3D' },
    Anyone: { background: 'rgba(16,42,67,0.09)',   color: '#102A43' },
  }[owner]

  return (
    <span className={badgeBase} style={style}>
      {owner}
    </span>
  )
}

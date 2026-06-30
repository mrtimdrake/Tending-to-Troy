'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  pinned: boolean
  /** Visual size in px. */
  size?: number
}

// A small brass drawing pin. Flat two-tone shading (no glossy gradient).
// Unpinned: a faint outline tack that hints the tap target. Pinned: a
// seated brass tack that settles in with a 250ms drop (no bounce).
export function BrassPin({ pinned, size = 18 }: Props) {
  const [animate, setAnimate] = useState(false)
  const mounted = useRef(false)

  // Only play the settle when the user pins — not on initial mount.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (pinned) {
      setAnimate(true)
      const t = setTimeout(() => setAnimate(false), 260)
      return () => clearTimeout(t)
    }
  }, [pinned])

  const brass = '#B48A3D'
  const brassDark = '#8F6D2F'

  return (
    <span
      className={animate ? 'animate-pin-drop' : undefined}
      style={{ display: 'inline-flex', transformOrigin: '50% 80%' }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {pinned ? (
          <>
            {/* needle */}
            <path d="M12 14.5V21" stroke={brassDark} strokeWidth="1.6" strokeLinecap="round" />
            {/* tack body */}
            <path
              d="M8.2 5.5C8.2 4.7 8.9 4 9.7 4h4.6c.8 0 1.5.7 1.5 1.5 0 .6-.4 1.2-1 1.4l-.7.3v3.1l1.4 1.2c.5.5.2 1.4-.5 1.5H7.2c-.7-.1-1-1-.5-1.5l1.4-1.2V7.2l-.7-.3c-.6-.2-1-.8-1-1.4Z"
              fill={brass}
              stroke={brassDark}
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            {/* head highlight */}
            <path d="M9.7 5.1h2.1" stroke="#D9B872" strokeWidth="1.1" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* faint outline affordance */}
            <path d="M12 14.5V21" stroke={brass} strokeWidth="1.4" strokeLinecap="round" opacity="0.3" />
            <path
              d="M8.2 5.5C8.2 4.7 8.9 4 9.7 4h4.6c.8 0 1.5.7 1.5 1.5 0 .6-.4 1.2-1 1.4l-.7.3v3.1l1.4 1.2c.5.5.2 1.4-.5 1.5H7.2c-.7-.1-1-1-.5-1.5l1.4-1.2V7.2l-.7-.3c-.6-.2-1-.8-1-1.4Z"
              stroke={brass}
              strokeWidth="1.2"
              strokeLinejoin="round"
              opacity="0.3"
            />
          </>
        )}
      </svg>
    </span>
  )
}

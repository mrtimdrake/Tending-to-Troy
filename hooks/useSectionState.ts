'use client'
import { useState, useEffect } from 'react'

export function useSectionState(priority: 1 | 2 | 3 | 4): [boolean, () => void] {
  const key = `ttt-section-${priority}`

  // Always start from the SSR-safe default so server and first client
  // render match. localStorage is read after mount to avoid hydration
  // mismatch.
  const [isOpen, setIsOpen] = useState<boolean>(priority <= 2)

  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      setIsOpen(stored === 'true')
    }
  }, [key])

  const toggle = () => {
    setIsOpen((prev) => {
      const next = !prev
      try {
        localStorage.setItem(key, String(next))
      } catch {
        // localStorage unavailable — state still updates in memory
      }
      return next
    })
  }

  return [isOpen, toggle]
}

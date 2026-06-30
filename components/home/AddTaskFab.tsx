'use client'
import { Plus } from 'lucide-react'

export function AddTaskFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Add task"
      className="fixed z-40 right-5 flex items-center justify-center w-14 h-14 rounded-full bg-brass text-ivory transition-transform duration-button hover:scale-105 active:scale-95"
      style={{
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom))',
        boxShadow: 'var(--shadow-lift)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Plus size={24} strokeWidth={2} />
    </button>
  )
}

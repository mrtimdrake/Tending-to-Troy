'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Segmented } from '@/components/ui/Segmented'
import type { CreateTaskInput, TaskPriority, TaskOwner, TaskLocation } from '@/features/tasks/types'

type Props = {
  open: boolean
  onClose: () => void
  onCreate: (input: CreateTaskInput) => Promise<boolean>
  error: string | null
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
]
const OWNER_OPTIONS: { value: TaskOwner; label: string }[] = [
  { value: 'tim', label: 'Tim' },
  { value: 'wife', label: 'Wife' },
  { value: 'anyone', label: 'Anyone' },
]
const LOCATION_OPTIONS: { value: TaskLocation; label: string }[] = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
]

export function NewTaskForm({ open, onClose, onCreate, error }: Props) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>(1)
  const [owner, setOwner] = useState<TaskOwner>('anyone')
  const [location, setLocation] = useState<TaskLocation>('indoor')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Reset to defaults each time the sheet opens.
  useEffect(() => {
    if (open) {
      setTitle('')
      setPriority(1)
      setOwner('anyone')
      setLocation('indoor')
      setDescription('')
      setNotes('')
      setSubmitting(false)
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || submitting) return
    setSubmitting(true)
    const ok = await onCreate({ title, priority, owner, location, description, notes })
    setSubmitting(false)
    if (ok) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Add a task"
    >
      <div
        className="absolute inset-0 bg-navy/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full sm:max-w-md bg-paper rounded-t-card sm:rounded-card p-6 max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: 'var(--shadow-lift)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-title text-navy">New task</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-9 h-9 -mr-1 rounded-lg text-slate hover:bg-navy/5 transition-colors duration-[120ms]"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            autoFocus
          />
          <Segmented label="Priority" value={priority} options={PRIORITY_OPTIONS} onChange={setPriority} />
          <Segmented label="Owner" value={owner} options={OWNER_OPTIONS} onChange={setOwner} />
          <Segmented label="Location" value={location} options={LOCATION_OPTIONS} onChange={setLocation} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-description" className="font-ui text-label text-slate">Description</label>
            <textarea
              id="new-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description…"
              rows={3}
              className="rounded-input border border-navy/15 bg-ivory px-4 py-3 font-body text-body text-navy outline-none focus:border-brass focus:ring-1 focus:ring-brass/20 transition-all duration-button placeholder:text-slate/50 resize-y min-h-[80px]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-notes" className="font-ui text-label text-slate">Notes</label>
            <textarea
              id="new-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes…"
              rows={3}
              className="rounded-input border border-navy/15 bg-ivory px-4 py-3 font-body text-body text-navy outline-none focus:border-brass focus:ring-1 focus:ring-brass/20 transition-all duration-button placeholder:text-slate/50 resize-y min-h-[80px]"
            />
          </div>

          {error && (
            <p className="font-ui text-small text-terracotta" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-1">
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={!title.trim()}
              className="flex-1"
            >
              Add task
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

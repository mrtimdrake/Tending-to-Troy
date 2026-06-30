'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { Segmented } from '@/components/ui/Segmented'
import { Button } from '@/components/ui/Button'
import { updateTask, archiveTask, restoreTask, deleteTask } from '@/features/tasks/actions'
import type { Task, UpdateTaskInput, TaskPriority, TaskOwner, TaskLocation } from '@/features/tasks/types'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' },
]
const OWNER_OPTIONS: { value: TaskOwner; label: string }[] = [
  { value: 'tim', label: 'Tim' }, { value: 'wife', label: 'Wife' }, { value: 'anyone', label: 'Anyone' },
]
const LOCATION_OPTIONS: { value: TaskLocation; label: string }[] = [
  { value: 'indoor', label: 'Indoor' }, { value: 'outdoor', label: 'Outdoor' },
]

export function TaskDetail({ task }: { task: Task }) {
  const router = useRouter()

  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [owner, setOwner] = useState<TaskOwner>(task.owner)
  const [location, setLocation] = useState<TaskLocation>(task.location)
  const [description, setDescription] = useState(task.description ?? '')
  const [notes, setNotes] = useState(task.notes ?? '')

  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Accumulates pending field changes so editing two fields within the
  // debounce window never drops the first one.
  const pendingRef = useRef<UpdateTaskInput>({})

  const save = useCallback(async (patch: UpdateTaskInput) => {
    setSaveState('saving')
    const result = await updateTask(task.id, patch)
    setSaveState('error' in result ? 'error' : 'saved')
  }, [task.id])

  // Text fields: debounce so we don't write on every keystroke. Merge into
  // the pending patch so multiple fields edited quickly all get saved.
  const debouncedSave = useCallback((patch: UpdateTaskInput) => {
    pendingRef.current = { ...pendingRef.current, ...patch }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const merged = pendingRef.current
      pendingRef.current = {}
      save(merged)
    }, 600)
  }, [save])

  // Immediate save (selects). Flush any pending debounced text edits with it
  // so nothing is lost.
  const saveNow = useCallback((patch: UpdateTaskInput) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const merged = { ...pendingRef.current, ...patch }
    pendingRef.current = {}
    save(merged)
  }, [save])

  async function runStatusAction(
    fn: (id: string) => Promise<{ error: string } | { task: Task }>
  ) {
    setBusy(true)
    setActionError(null)
    const result = await fn(task.id)
    if ('error' in result) {
      setActionError(result.error)
      setBusy(false)
      setConfirmDelete(false) // reveal the error (dialog would otherwise cover it)
      return
    }
    router.push('/home')
  }

  const archive = () => runStatusAction(archiveTask)
  const restore = () => runStatusAction(restoreTask)
  const remove = () => runStatusAction(deleteTask)

  return (
    <div className="min-h-screen bg-paper">
      <header
        className="sticky top-0 z-10 bg-ivory border-b border-navy/10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto max-w-content px-4 flex items-center justify-between py-2 min-h-[52px]">
          <button
            onClick={() => router.push('/home')}
            aria-label="Back"
            className="flex items-center justify-center w-11 h-11 -ml-2 rounded-lg text-slate hover:bg-navy/5 transition-colors duration-[120ms]"
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
          <SaveIndicator state={saveState} />
        </div>
      </header>

      <main className="mx-auto max-w-content px-4 pt-6 pb-20 flex flex-col gap-6">
        {task.status === 'archived' && (
          <div className="rounded-input bg-brass/10 px-4 py-3 font-ui text-small text-brass">
            This task is archived.
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="font-ui text-label text-slate">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); debouncedSave({ title: e.target.value }) }}
            className="font-body text-title text-navy bg-transparent outline-none border-b border-navy/15 focus:border-brass pb-1 transition-colors duration-[120ms]"
          />
        </div>

        <Segmented label="Priority" value={priority} options={PRIORITY_OPTIONS}
          onChange={(v) => { setPriority(v); saveNow({ priority: v }) }} />
        <Segmented label="Owner" value={owner} options={OWNER_OPTIONS}
          onChange={(v) => { setOwner(v); saveNow({ owner: v }) }} />
        <Segmented label="Location" value={location} options={LOCATION_OPTIONS}
          onChange={(v) => { setLocation(v); saveNow({ location: v }) }} />

        <Field label="Description" value={description}
          onChange={(v) => { setDescription(v); debouncedSave({ description: v || null }) }}
          placeholder="Add a description…" />

        <Field label="Notes" value={notes}
          onChange={(v) => { setNotes(v); debouncedSave({ notes: v || null }) }}
          placeholder="Add any notes…" />

        <div className="flex flex-col gap-3 pt-2 border-t border-navy/10">
          {task.status === 'archived' ? (
            <Button variant="secondary" onClick={restore} loading={busy}>Restore task</Button>
          ) : (
            <Button variant="secondary" onClick={archive} loading={busy}>Archive task</Button>
          )}
          <button
            onClick={() => setConfirmDelete(true)}
            className="font-ui text-small text-terracotta min-h-[44px] hover:underline self-start"
          >
            Delete task
          </button>
          {actionError && (
            <p className="font-ui text-small text-terracotta" role="alert">
              {actionError}
            </p>
          )}
        </div>
      </main>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-navy/30" onClick={() => setConfirmDelete(false)} aria-hidden="true" />
          <div className="relative w-full max-w-sm mx-4 bg-paper rounded-card p-6" style={{ boxShadow: 'var(--shadow-lift)' }}>
            <h2 className="font-heading text-title text-navy mb-2">Delete this task?</h2>
            <p className="font-ui text-small text-slate mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)} className="flex-1">Cancel</Button>
              <Button variant="danger" onClick={remove} loading={busy} className="flex-1">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const id = label.toLowerCase()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-ui text-label text-slate">{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="rounded-input border border-navy/15 bg-ivory px-4 py-3 font-body text-body text-navy outline-none focus:border-brass focus:ring-1 focus:ring-brass/20 transition-all duration-button placeholder:text-slate/50 resize-y min-h-[88px]"
      />
    </div>
  )
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return null
  const map = {
    saving: { icon: <Loader2 size={14} className="animate-spin" />, text: 'Saving…', cls: 'text-slate' },
    saved: { icon: <Check size={14} />, text: 'Saved', cls: 'text-moss' },
    error: { icon: null, text: 'Could not save', cls: 'text-terracotta' },
  }[state]
  return (
    <span className={`flex items-center gap-1.5 font-ui text-label ${map.cls}`}>
      {map.icon}{map.text}
    </span>
  )
}

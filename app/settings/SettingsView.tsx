'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Check } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { signOut } from '@/lib/auth/actions'
import { updateSettings } from './actions'
import { InvitationPanel } from './InvitationPanel'

type Props = {
  name: string
  email: string
  householdName: string
  invitation: { token: string; invitationUsed: boolean } | null
}

export function SettingsView({ name, email, householdName, invitation }: Props) {
  const router = useRouter()
  const [signingOut, startSignOut] = useTransition()

  const [nameValue, setNameValue] = useState(name)
  const [householdValue, setHouseholdValue] = useState(householdName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const dirty = nameValue.trim() !== name || householdValue.trim() !== householdName
  const canSave = dirty && nameValue.trim() !== '' && householdValue.trim() !== ''

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError(null)
    const result = await updateSettings({
      name: nameValue,
      householdName: householdValue,
    })
    setSaving(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <header
        className="sticky top-0 z-10 bg-ivory border-b border-navy/10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto max-w-content px-4 flex items-center py-2 min-h-[52px]">
          <button
            onClick={() => router.push('/home')}
            aria-label="Back"
            className="flex items-center justify-center w-11 h-11 -ml-2 rounded-lg text-slate hover:bg-navy/5 transition-colors duration-[120ms]"
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
          <h1 className="font-heading text-title text-navy ml-1">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-content px-4 pt-6 pb-20 flex flex-col gap-6">
        <section
          className="rounded-card bg-ivory p-6 flex flex-col gap-4"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <Input
            label="Your name"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <span className="font-ui text-label text-slate">Email</span>
            <p className="font-body text-body text-navy">{email}</p>
          </div>
          <Input
            label="Home name"
            value={householdValue}
            onChange={(e) => setHouseholdValue(e.target.value)}
          />

          {error && (
            <p className="font-ui text-small text-terracotta" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              loading={saving}
              disabled={!canSave}
              onClick={handleSave}
            >
              Save changes
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 font-ui text-label text-moss">
                <Check size={14} /> Saved
              </span>
            )}
          </div>
        </section>

        {invitation && (
          <section
            className="rounded-card bg-ivory overflow-hidden"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <button
              onClick={() => setInviteOpen((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
              aria-expanded={inviteOpen}
            >
              <span className="font-ui text-body text-navy">Invite your partner</span>
              <ChevronRight
                size={16}
                strokeWidth={2}
                className="text-slate transition-transform duration-[180ms]"
                style={{ transform: inviteOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>
            {inviteOpen && (
              <div className="px-6 pb-6">
                <InvitationPanel
                  token={invitation.token}
                  invitationUsed={invitation.invitationUsed}
                />
              </div>
            )}
          </section>
        )}

        <div className="pt-2 border-t border-navy/10">
          <Button
            variant="secondary"
            loading={signingOut}
            onClick={() => startSignOut(() => { signOut() })}
          >
            Sign out
          </Button>
        </div>
      </main>
    </div>
  )
}

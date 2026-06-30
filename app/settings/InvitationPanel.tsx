'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { regenerateInvitationToken } from '@/lib/auth/actions'
import { useRouter } from 'next/navigation'

interface Props {
  token: string
  invitationUsed: boolean
}

export function InvitationPanel({ token: initialToken, invitationUsed }: Props) {
  const [token, setToken] = useState(initialToken)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const inviteUrl = `${origin}/auth/invite/${token}`

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleRegenerate() {
    startTransition(async () => {
      const result = await regenerateInvitationToken()
      if (result.error) {
        setError(result.error)
      } else if (result.token) {
        setToken(result.token)
        setError(null)
        router.refresh()
      }
    })
  }

  return (
    <div>
      <p className="mb-4 font-ui text-small text-slate">
        Share this link with the other person in your household. It can only be used once.
      </p>

      <div className="mb-4 rounded-input border border-navy/15 bg-paper px-4 py-3 font-ui text-small text-slate break-all">
        {inviteUrl}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCopy} variant="primary" className="flex-1">
          {copied ? 'Copied!' : 'Copy invitation link'}
        </Button>
        <Button
          onClick={handleRegenerate}
          variant="secondary"
          loading={isPending}
        >
          New link
        </Button>
      </div>

      {error && (
        <p className="mt-3 font-ui text-small text-terracotta" role="alert">
          {error}
        </p>
      )}

      {invitationUsed && (
        <p className="mt-3 font-ui text-small text-moss">
          This invitation has been accepted.
        </p>
      )}
    </div>
  )
}

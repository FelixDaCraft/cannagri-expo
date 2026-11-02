'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ButtonLink, buttonClasses } from '@/components/ui/ButtonLink'
import { AuthShell, authLinkClass } from '@/components/auth/AuthShell'
import { cn } from '@/lib/utils'

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'CONTRIBUTOR'] as const

interface InvitationData {
  email: string
  role: string
  invitedBy: { name: string | null; email: string }
}

export default function InvitationPage() {
  const t = useTranslations('auth.invitation')
  const params = useParams()
  const token = params.token as string
  const router = useRouter()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await fetch(`/api/invitation/${encodeURIComponent(token)}`)
        const data = await res.json()
        if (res.ok) setInvitation(data.invitation)
        else setErrorKey('invalid')
      } catch {
        setErrorKey('network')
      } finally {
        setLoading(false)
      }
    }
    fetchInvitation()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorKey(null)
    if (password !== confirmPassword) return setErrorKey('mismatch')
    if (password.length < 8) return setErrorKey('tooShort')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/invitation/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/connexion'), 3000)
      } else {
        setErrorKey('createFailed')
      }
    } catch {
      setErrorKey('network')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AuthShell title={t('title')}>
        <div role="status" className="flex items-center gap-4">
          <span aria-hidden="true" className="h-8 w-8 shrink-0 animate-spin rounded-full border-4 border-forest/20 border-t-forest motion-reduce:animate-none" />
          <p className="text-lg text-ink">{t('loading')}</p>
        </div>
      </AuthShell>
    )
  }

  if (!invitation) {
    return (
      <AuthShell title={t('invalidTitle')}>
        <p className="text-lg text-ink">{t(`errors.${errorKey ?? 'invalid'}`)}</p>
        <ButtonLink href="/" className="mt-6">{t('home')}</ButtonLink>
      </AuthShell>
    )
  }

  if (success) {
    return (
      <AuthShell title={t('successTitle')}>
        <p role="status" className="text-lg text-ink">{t('successText')}</p>
      </AuthShell>
    )
  }

  const role = ROLES.find((r) => r === invitation.role) ?? 'CONTRIBUTOR'

  return (
    <AuthShell
      title={t('title')}
      lead={t('lead', { role: t(`roles.${role}`) })}
      after={
        <p>
          {t('hasAccount')} <Link href="/connexion" className={authLinkClass}>{t('login')}</Link>
        </p>
      }
    >
      {invitation.invitedBy && <p className="mb-6 text-base text-ink">{t('invitedBy', { name: invitation.invitedBy.name || invitation.invitedBy.email })}</p>}
      {errorKey && <p role="alert" className="notice-error mb-6">{t(`errors.${errorKey}`)}</p>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="invite-email" className="field-label">{t('email')}</label>
          <input id="invite-email" type="email" value={invitation.email} disabled className="field-input bg-cream-100 opacity-80" />
        </div>
        <div>
          <label htmlFor="invite-name" className="field-label">{t('name')}</label>
          <input id="invite-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required className="field-input" />
        </div>
        <div>
          <label htmlFor="invite-password" className="field-label">{t('password')}</label>
          <input id="invite-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} aria-describedby="invite-password-hint" className="field-input" />
          <p id="invite-password-hint" className="field-hint">{t('passwordHint')}</p>
        </div>
        <div>
          <label htmlFor="invite-confirm" className="field-label">{t('confirmPassword')}</label>
          <input id="invite-confirm" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="field-input" />
        </div>
        <button type="submit" disabled={submitting} aria-busy={submitting || undefined} className={cn(buttonClasses({ size: 'lg' }), 'w-full disabled:opacity-60')}>
          {submitting ? t('submitting') : t('submit')}
        </button>
      </form>
    </AuthShell>
  )
}

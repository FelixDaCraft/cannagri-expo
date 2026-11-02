'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ButtonLink, buttonClasses } from '@/components/ui/ButtonLink'
import { AuthShell } from '@/components/auth/AuthShell'
import { cn } from '@/lib/utils'

function Spinner({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center gap-4">
      <span aria-hidden="true" className="h-8 w-8 shrink-0 animate-spin rounded-full border-4 border-forest/20 border-t-forest motion-reduce:animate-none" />
      <p className="text-lg text-ink">{label}</p>
    </div>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const t = useTranslations('auth.resetPassword')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  useEffect(() => {
    if (!token) {
      setIsValidToken(false)
      return
    }
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
        setIsValidToken(response.ok)
      } catch {
        setIsValidToken(false)
      }
    }
    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    if (password !== confirmPassword) {
      setErrorMessage(t('passwordMismatch'))
      return
    }
    if (password.length < 8) {
      setErrorMessage(t('passwordTooShort'))
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!response.ok) {
        setErrorMessage(t('errorGeneric'))
      } else {
        setIsSuccess(true)
        setTimeout(() => router.push('/connexion'), 3000)
      }
    } catch {
      setErrorMessage(t('errorGeneric'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidToken === null) {
    return (
      <AuthShell eyebrow={t('badge')} title={t('title')}>
        <Spinner label={t('verifying')} />
      </AuthShell>
    )
  }

  if (!isValidToken) {
    return (
      <AuthShell eyebrow={t('badge')} title={t('invalidTokenTitle')}>
        <p className="text-lg text-ink">{t('invalidTokenMessage')}</p>
        <ButtonLink href="/mot-de-passe-oublie" className="mt-6">{t('requestNewLink')}</ButtonLink>
      </AuthShell>
    )
  }

  if (isSuccess) {
    return (
      <AuthShell eyebrow={t('badge')} title={t('successTitle')}>
        <p role="status" className="text-lg text-ink">{t('successMessage')}</p>
        <ButtonLink href="/connexion" className="mt-6">{t('goToLogin')}</ButtonLink>
      </AuthShell>
    )
  }

  return (
    <AuthShell eyebrow={t('badge')} title={t('title')} lead={t('subtitle')}>
      {errorMessage && <p role="alert" className="notice-error mb-6">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="field-label">{t('newPassword')}</label>
          <input
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            aria-describedby="password-hint"
            className="field-input"
          />
          <p id="password-hint" className="field-hint">{t('passwordRequirement')}</p>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="field-label">{t('confirmPassword')}</label>
          <input
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="field-input"
          />
        </div>
        <button type="submit" disabled={isLoading} aria-busy={isLoading || undefined} className={cn(buttonClasses({ size: 'lg' }), 'w-full disabled:opacity-60')}>
          {isLoading ? t('submitting') : t('submit')}
        </button>
      </form>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-cream" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}

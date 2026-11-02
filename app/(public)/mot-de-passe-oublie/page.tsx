'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ButtonLink, buttonClasses } from '@/components/ui/ButtonLink'
import { AuthShell, authLinkClass } from '@/components/auth/AuthShell'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword')

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        setErrorMessage(t(response.status === 429 ? 'tooMany' : 'errorGeneric'))
      } else {
        setIsSuccess(true)
      }
    } catch {
      setErrorMessage(t('errorGeneric'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthShell eyebrow={t('badge')} title={t('successTitle')}>
        <p role="status" className="text-lg text-ink">{t('successMessage')}</p>
        <ButtonLink href="/connexion" className="mt-6">{t('backToLogin')}</ButtonLink>
      </AuthShell>
    )
  }

  return (
    <AuthShell eyebrow={t('badge')} title={t('title')} lead={t('subtitle')}>
      {errorMessage && <p role="alert" className="notice-error mb-6">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="field-label">{t('email')}</label>
          <input type="email" id="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field-input" placeholder={t('emailPlaceholder')} />
        </div>
        <button type="submit" disabled={isLoading} aria-busy={isLoading || undefined} className={cn(buttonClasses({ size: 'lg' }), 'w-full disabled:opacity-60')}>
          {isLoading ? t('submitting') : t('submit')}
        </button>
      </form>
      <p className="mt-6 text-base">
        <Link href="/connexion" className={authLinkClass}>{t('backToLogin')}</Link>
      </p>
    </AuthShell>
  )
}

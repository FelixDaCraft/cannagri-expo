'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { AuthShell } from '@/components/auth/AuthShell'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const t = useTranslations('auth.verifyEmail')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading')
  const [errorKey, setErrorKey] = useState<'noToken' | 'errorGeneric'>('errorGeneric')

  useEffect(() => {
    if (!token) {
      setErrorKey('noToken')
      setStatus('error')
      return
    }
    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await response.json()
        if (response.ok) setStatus('success')
        else if (data.alreadyVerified) setStatus('already-verified')
        else {
          setErrorKey('errorGeneric')
          setStatus('error')
        }
      } catch {
        setErrorKey('errorGeneric')
        setStatus('error')
      }
    }
    verifyEmail()
  }, [token])

  if (status === 'loading') {
    return (
      <AuthShell title={t('verifying')}>
        <div role="status" className="flex items-center gap-4">
          <span aria-hidden="true" className="h-8 w-8 shrink-0 animate-spin rounded-full border-4 border-forest/20 border-t-forest motion-reduce:animate-none" />
          <p className="text-lg text-ink">{t('pleaseWait')}</p>
        </div>
      </AuthShell>
    )
  }

  if (status === 'success' || status === 'already-verified') {
    const done = status === 'success'
    return (
      <AuthShell title={done ? t('successTitle') : t('alreadyVerifiedTitle')}>
        <p role="status" className="text-lg text-ink">{done ? t('successMessage') : t('alreadyVerifiedMessage')}</p>
        <ButtonLink href="/connexion" className="mt-6">{t('goToLogin')}</ButtonLink>
      </AuthShell>
    )
  }

  return (
    <AuthShell title={t('errorTitle')}>
      <p className="text-lg text-ink">{t(errorKey)}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/connexion">{t('goToLogin')}</ButtonLink>
        <ButtonLink href="/inscription" tone="outline-night">{t('registerAgain')}</ButtonLink>
      </div>
    </AuthShell>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-cream" />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

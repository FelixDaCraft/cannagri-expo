'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent, Button } from '@/components/ui'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const t = useTranslations('auth.verifyEmail')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage(t('noToken'))
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

        if (response.ok) {
          setStatus('success')
        } else if (data.alreadyVerified) {
          setStatus('already-verified')
        } else {
          setStatus('error')
          setErrorMessage(data.error || t('errorGeneric'))
        }
      } catch {
        setStatus('error')
        setErrorMessage(t('errorGeneric'))
      }
    }

    verifyEmail()
  }, [token, t])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-forest border-t-transparent rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-heading font-bold text-heading mb-2">
                  {t('verifying')}
                </h2>
                <p className="text-body/70">{t('pleaseWait')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-heading font-bold text-heading mb-2">
                  {t('successTitle')}
                </h2>
                <p className="text-body/70 mb-6">
                  {t('successMessage')}
                </p>
                <Link href="/connexion">
                  <Button variant="primary" className="w-full">
                    {t('goToLogin')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'already-verified') {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-heading font-bold text-heading mb-2">
                  {t('alreadyVerifiedTitle')}
                </h2>
                <p className="text-body/70 mb-6">
                  {t('alreadyVerifiedMessage')}
                </p>
                <Link href="/connexion">
                  <Button variant="primary" className="w-full">
                    {t('goToLogin')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-heading font-bold text-heading mb-2">
                {t('errorTitle')}
              </h2>
              <p className="text-body/70 mb-6">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <Link href="/inscription">
                  <Button variant="primary" className="w-full">
                    {t('registerAgain')}
                  </Button>
                </Link>
                <Link href="/connexion">
                  <Button variant="outline" className="w-full">
                    {t('goToLogin')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-forest border-t-transparent rounded-full mx-auto"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

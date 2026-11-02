'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { buttonClasses } from '@/components/ui/ButtonLink'
import { AuthShell } from '@/components/auth/AuthShell'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations('auth.register')
  const tCommon = useTranslations('common')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
    siret: '',
    businessType: '' as 'PRODUCTEURS' | 'MATERIEL' | 'LIFESTYLE' | 'SERVICE' | '',
    wantsPro: false,
    acceptTerms: false,
    acceptNewsletter: false,
  })

  // Après un achat de billets sans compte : /inscription?email=… pré-remplit l'adresse
  useEffect(() => {
    const email = new URLSearchParams(window.location.search).get('email')
    if (email && email.length <= 254) {
      setFormData((prev) => (prev.email ? prev : { ...prev, email }))
    }
  }, [])

  const businessTypeLabels = {
    PRODUCTEURS: t('businessTypes.PRODUCTEURS'),
    MATERIEL: t('businessTypes.MATERIEL'),
    LIFESTYLE: t('businessTypes.LIFESTYLE'),
    SERVICE: t('businessTypes.SERVICE'),
  }
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target
    const name = target.name
    const value = target.value
    const type = target.type
    const checked = (target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(t('passwordsNotMatch'))
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setErrorMessage(t('passwordTooShort'))
      setIsLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setErrorMessage(t('mustAcceptTerms'))
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          phone: formData.phone,
          siret: formData.wantsPro ? formData.siret : null,
          businessType: formData.wantsPro ? formData.businessType : null,
          wantsPro: formData.wantsPro,
          newsletter: formData.acceptNewsletter,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || t('error'))
        return
      }

      // Auto login after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.ok) {
        // Redirect based on account type
        if (data.isPro) {
          // PRO account pending approval - go to account page
          router.push('/compte?message=pro-pending')
        } else {
          // Standard account - go to home
          router.push('/')
        }
        router.refresh()
      } else {
        const message = data.isPro
          ? t('proPending')
          : t('accountCreated')
        router.push(`/connexion?message=${encodeURIComponent(message)}`)
      }
    } catch {
      setErrorMessage(t('error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthRegister = async (provider: string) => {
    setIsLoading(true)
    await signIn(provider, { callbackUrl: '/pro' })
  }

  const oauthProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      bg: 'bg-white hover:border-forest',
      text: 'text-forest',
      border: 'border border-forest/30',
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ),
      bg: 'bg-black hover:bg-forest-800',
      text: 'text-white',
      border: '',
    },
  ]

  return (
    <AuthShell
      eyebrow={t('proSpace')}
      title={t('title')}
      lead={t('subtitle')}
      after={
        <>
          <h2 className="font-condensed text-lg font-semibold text-forest">{t('dataProtection')}</h2>
          <p className="mt-1">{t('dataProtectionText')}</p>
        </>
      }
    >
              {/* Error messages */}
              {errorMessage && <p role="alert" className="notice-error mb-6">{errorMessage}</p>}

              {/* OAuth Providers */}
              <div className="space-y-3 mb-6">
                {oauthProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleOAuthRegister(provider.id)}
                    disabled={isLoading}
                    type="button"
                    className={`flex min-h-[48px] w-full items-center justify-center gap-3 rounded-[10px] px-4 font-condensed text-lg font-semibold transition-colors ${provider.bg} ${provider.text} ${provider.border} disabled:opacity-50`}
                  >
                    {provider.icon}
                    <span>{tCommon('registerWith', { provider: provider.name })}</span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4 text-base text-ink" role="separator">
                <span className="h-px flex-1 bg-forest/20" />
                {t('orWithEmail')}
                <span className="h-px flex-1 bg-forest/20" />
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="field-label">
                      {t('fullName')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="field-input"
                      placeholder={t('namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="field-label">
                      {t('phone')} <span className="font-body text-base font-normal text-ink">{t('optional')}</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="field-input"
                      placeholder={t('phonePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="field-label">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="field-input"
                    placeholder={t('emailPlaceholder')}
                  />
                </div>

                {/* Section demande compte PRO */}
                <div className="space-y-4 rounded-xl border border-forest/20 p-4">
                  <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      name="wantsPro"
                      checked={formData.wantsPro}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-forest/50 accent-forest"
                    />
                    <span className="font-medium text-forest">
                      {t('wantProAccount')}
                    </span>
                  </label>

                  {formData.wantsPro && (
                    <div className="space-y-4 pt-2 border-t border-forest/20">
                      <p className="text-base text-ink">
                        {t('proAccountInfo')}
                      </p>

                      <div>
                        <label htmlFor="companyName" className="field-label">
                          {t('company')}
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          autoComplete="organization"
                          value={formData.companyName}
                          onChange={handleChange}
                          required={formData.wantsPro}
                          className="field-input"
                          placeholder={t('companyPlaceholder')}
                        />
                      </div>

                      <div>
                        <label htmlFor="siret" className="field-label">
                          {t('siret')}
                        </label>
                        <input
                          type="text"
                          id="siret"
                          name="siret"
                          autoComplete="off"
                          value={formData.siret}
                          onChange={handleChange}
                          required={formData.wantsPro}
                          className="field-input"
                          placeholder={t('siretPlaceholder')}
                          maxLength={17}
                        />
                      </div>

                      <div>
                        <label htmlFor="businessType" className="field-label">
                          {t('businessType')}
                        </label>
                        <select
                          id="businessType"
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleChange}
                          required={formData.wantsPro}
                          className="field-input"
                        >
                          <option value="">{t('selectBusinessType')}</option>
                          {Object.entries(businessTypeLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="field-label">
                    {t('password')}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="field-input"
                    placeholder={t('passwordPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="field-label">
                    {t('confirmPassword')}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="field-input"
                    placeholder={t('confirmPasswordPlaceholder')}
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      required
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-forest/50 accent-forest"
                    />
                    <span className="text-base text-ink">
                      {t('acceptTerms')}{' '}
                      <Link href="/mentions-legales" className="text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-mint">
                        {t('legalLinks')}
                      </Link>{' '}
                      {t('and')}{' '}
                      <Link href="/confidentialite" className="text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-mint">
                        {t('privacyPolicy')}
                      </Link>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      name="acceptNewsletter"
                      checked={formData.acceptNewsletter}
                      onChange={handleChange}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-forest/50 accent-forest"
                    />
                    <span className="text-base text-ink">
                      {t('newsletter')}
                    </span>
                  </label>
                </div>

                <button type="submit" disabled={isLoading} aria-busy={isLoading || undefined} className={cn(buttonClasses({ size: 'lg' }), 'w-full disabled:opacity-60')}>
                  {isLoading ? t('submitting') : t('submit')}
                </button>
              </form>

              {/* Login link */}
              <p className="mt-6 text-base text-ink">
                {t('hasAccount')}{' '}
                <Link href="/connexion" className="font-medium text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-mint">
                  {t('login')}
                </Link>
              </p>
    </AuthShell>
  )
}

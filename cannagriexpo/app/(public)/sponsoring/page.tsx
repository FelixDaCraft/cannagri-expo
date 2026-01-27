'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { siteConfig } from '@/config/site'

export default function SponsoringPage() {
  const t = useTranslations('sponsoring')

  const sponsorPackages = [
    {
      key: 'platinum',
      color: 'bg-gradient-to-br from-slate-700 to-slate-900',
      borderColor: 'ring-slate-600',
    },
    {
      key: 'gold',
      color: 'bg-gradient-to-br from-amber-400 to-amber-600',
      borderColor: 'ring-amber-500',
    },
    {
      key: 'silver',
      color: 'bg-gradient-to-br from-gray-300 to-gray-400',
      borderColor: 'ring-gray-400',
    },
    {
      key: 'bronze',
      color: 'bg-gradient-to-br from-orange-600 to-orange-800',
      borderColor: 'ring-orange-600',
    },
  ]

  const benefits = [
    {
      key: 'visibility',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      key: 'notoriety',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      key: 'network',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="forest" className="mb-4">{t('badge')}</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-heading mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-body/70 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Benefits */}
        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-sage/20 flex items-center justify-center text-forest">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                  {t(`benefits.${benefit.key}.title`)}
                </h3>
                <p className="text-body/70">{t(`benefits.${benefit.key}.description`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section className="mb-16">
          <h2 className="text-3xl font-heading font-bold text-heading text-center mb-4">
            {t('packagesTitle')}
          </h2>
          <p className="text-center text-body/70 mb-10 max-w-2xl mx-auto">
            {t('packagesSubtitle')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {sponsorPackages.map((pkg, index) => (
              <Card
                key={index}
                variant="bordered"
                className={`ring-2 ${pkg.borderColor} overflow-hidden`}
              >
                <div className={`${pkg.color} py-6 px-4 text-center`}>
                  <h3 className="text-2xl font-heading font-bold text-white drop-shadow-md">
                    {t(`tiers.${pkg.key}.name`)}
                  </h3>
                </div>
                <CardContent className="p-4 text-center">
                  <p className="text-body/70 text-sm">{t(`tiers.${pkg.key}.description`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form Section */}
        <SponsorRequestForm t={t} />
      </div>
    </div>
  )
}

interface SponsorRequestFormProps {
  t: ReturnType<typeof useTranslations<'sponsoring'>>
}

function SponsorRequestForm({ t }: SponsorRequestFormProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/sponsor-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setStatus('success')
        setMessage(t('form.success'))
        setFormData({ companyName: '', contactName: '', email: '', phone: '' })
      } else {
        const data = await res.json()
        setStatus('error')
        setMessage(data.error || t('form.error'))
      }
    } catch {
      setStatus('error')
      setMessage(t('form.error'))
    }
  }

  return (
    <section className="bg-white rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-bold text-heading mb-4">
          {t('form.title')}
        </h2>
        <p className="text-body/70 max-w-xl mx-auto">
          {t('form.subtitle')}
        </p>
      </div>

      {status === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-800 font-medium">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-heading mb-2">
                {t('form.company')} *
              </label>
              <input
                type="text"
                id="companyName"
                required
                autoComplete="organization"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent transition-all"
                placeholder={t('form.companyPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-heading mb-2">
                {t('form.contact')} *
              </label>
              <input
                type="text"
                id="contactName"
                required
                autoComplete="name"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent transition-all"
                placeholder={t('form.contactPlaceholder')}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-heading mb-2">
                {t('form.email')} *
              </label>
              <input
                type="email"
                id="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent transition-all"
                placeholder={t('form.emailPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-heading mb-2">
                {t('form.phone')} *
              </label>
              <input
                type="tel"
                id="phone"
                required
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent transition-all"
                placeholder={t('form.phonePlaceholder')}
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
              {message}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('form.sending')}
              </>
            ) : (
              t('form.submit')
            )}
          </Button>

          <p className="text-xs text-body/60 text-center">
            {t('form.privacyNotice')}{' '}
            <a href="/confidentialite" className="underline hover:text-forest">
              {t('form.privacyPolicy')}
            </a>.
          </p>
        </form>
      )}

      {/* Alternative contact */}
      <div className="mt-8 pt-8 border-t border-gray-200 text-center">
        <p className="text-sm text-body/60 mb-2">{t('alternativeContact.title')}</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="text-forest hover:underline flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {siteConfig.contact.email}
          </a>
        </div>
      </div>
    </section>
  )
}

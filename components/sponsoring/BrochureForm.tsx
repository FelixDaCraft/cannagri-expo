'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { buttonClasses } from '@/components/ui/ButtonLink'
import { cn } from '@/lib/utils'

const EMPTY = { companyName: '', contactName: '', email: '', phone: '' }

/** Demande de plaquette : 3 champs obligatoires, téléphone facultatif (constat n°10) */
export function BrochureForm() {
  const t = useTranslations('sponsoring.form')
  const [formData, setFormData] = useState(EMPTY)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorKey, setErrorKey] = useState<'error' | 'invalid'>('error')
  // anti-spam : champ piège et heure d'affichage du formulaire (un humain met plus de 3 s à le remplir)
  const [honeypot, setHoneypot] = useState('')
  const startedAt = useRef<number | null>(null)
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  const update = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((data) => ({ ...data, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/sponsor-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, website: honeypot, startedAt: startedAt.current ?? undefined }),
      })
      if (res.ok) {
        setStatus('success')
        setFormData(EMPTY)
      } else {
        setErrorKey(res.status === 400 ? 'invalid' : 'error')
        setStatus('error')
      }
    } catch {
      setErrorKey('error')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="notice-success text-lg">
        <p className="font-condensed text-2xl font-semibold">{t('successTitle')}</p>
        <p className="mt-1">{t('success')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="companyName" className="field-label">{t('company')}</label>
          <input id="companyName" type="text" required autoComplete="organization" value={formData.companyName} onChange={update('companyName')} className="field-input" />
        </div>
        <div>
          <label htmlFor="contactName" className="field-label">{t('contact')}</label>
          <input id="contactName" type="text" required autoComplete="name" value={formData.contactName} onChange={update('contactName')} className="field-input" />
        </div>
        <div>
          <label htmlFor="email" className="field-label">{t('email')}</label>
          <input id="email" type="email" required autoComplete="email" value={formData.email} onChange={update('email')} className="field-input" placeholder={t('emailPlaceholder')} />
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            {t('phone')} <span className="font-body text-base font-normal text-ink">{t('optional')}</span>
          </label>
          <input id="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={update('phone')} className="field-input" />
        </div>
      </div>

      {/* Champ piège : invisible et ignoré par les humains, rempli par les robots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="brochure-website">{t('honeypot')}</label>
        <input id="brochure-website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      {status === 'error' && <p role="alert" className="notice-error">{t(errorKey)}</p>}

      <button type="submit" disabled={status === 'loading'} aria-busy={status === 'loading' || undefined} className={cn(buttonClasses({ size: 'lg' }), 'w-full disabled:opacity-60 sm:w-auto')}>
        {status === 'loading' ? t('sending') : t('submit')}
      </button>

      <p className="text-base text-ink">
        {t('privacyNotice')}{' '}
        <Link href="/confidentialite" className="text-forest underline underline-offset-4 decoration-forest/40 hover:decoration-mint">
          {t('privacyPolicy')}
        </Link>
        .
      </p>
    </form>
  )
}

'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { buttonClasses } from '@/components/ui/ButtonLink'
import { cn } from '@/lib/utils'

export type ContactType = 'GENERAL' | 'PRESS' | 'SPONSOR' | 'EXHIBITOR'

const TYPES: { value: ContactType; key: string }[] = [
  { value: 'GENERAL', key: 'general' },
  { value: 'PRESS', key: 'press' },
  { value: 'SPONSOR', key: 'sponsor' },
  { value: 'EXHIBITOR', key: 'exhibitor' },
]

export function ContactForm({ initialType = 'GENERAL' }: { initialType?: ContactType }) {
  const t = useTranslations('contact')
  const empty = { type: initialType, name: '', email: '', phone: '', company: '', subject: '', message: '' }
  const [formData, setFormData] = useState(empty)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorKey, setErrorKey] = useState<'error' | 'invalid' | 'connectionError'>('error')

  const update = (field: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData((data) => ({ ...data, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setErrorKey(res.status === 400 ? 'invalid' : 'error')
        setStatus('error')
      }
    } catch {
      setErrorKey('connectionError')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="notice-success text-lg">
        <p className="font-condensed text-2xl font-semibold">{t('form.success')}</p>
        <p className="mt-1">{t('form.successMessage')}</p>
        <button
          type="button"
          onClick={() => { setFormData((data) => ({ ...data, subject: '', message: '' })); setStatus('idle') }}
          className={cn(buttonClasses({ tone: 'outline-night', size: 'sm' }), 'mt-4')}
        >
          {t('form.sendAnother')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="contact-type" className="field-label">{t('form.type')}</label>
        <select id="contact-type" value={formData.type} onChange={update('type')} className="field-input">
          {TYPES.map((type) => (
            <option key={type.value} value={type.value}>{t(`types.${type.key}`)}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="field-label">{t('form.name')}</label>
          <input id="contact-name" required autoComplete="name" value={formData.name} onChange={update('name')} className="field-input" />
        </div>
        <div>
          <label htmlFor="contact-email" className="field-label">{t('form.email')}</label>
          <input id="contact-email" type="email" required autoComplete="email" value={formData.email} onChange={update('email')} className="field-input" placeholder={t('form.emailPlaceholder')} />
        </div>
        <div>
          <label htmlFor="contact-phone" className="field-label">
            {t('form.phone')} <span className="font-body text-base font-normal text-ink">{t('form.optional')}</span>
          </label>
          <input id="contact-phone" type="tel" autoComplete="tel" value={formData.phone} onChange={update('phone')} className="field-input" />
        </div>
        <div>
          <label htmlFor="contact-company" className="field-label">
            {t('form.company')} <span className="font-body text-base font-normal text-ink">{t('form.optional')}</span>
          </label>
          <input id="contact-company" autoComplete="organization" value={formData.company} onChange={update('company')} className="field-input" />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="field-label">{t('form.subject')}</label>
        <input id="contact-subject" required autoComplete="off" value={formData.subject} onChange={update('subject')} className="field-input" />
      </div>

      <div>
        <label htmlFor="contact-message" className="field-label">{t('form.message')}</label>
        <textarea id="contact-message" required rows={6} value={formData.message} onChange={update('message')} className="field-input resize-y" />
      </div>

      {status === 'error' && <p role="alert" className="notice-error">{t(`form.${errorKey}`)}</p>}

      <button type="submit" disabled={status === 'loading'} aria-busy={status === 'loading' || undefined} className={cn(buttonClasses({ size: 'lg' }), 'w-full disabled:opacity-60 sm:w-auto')}>
        {status === 'loading' ? t('form.sending') : t('form.send')}
      </button>

      <p className="text-base text-ink">
        {t('form.privacyNotice')}{' '}
        <Link href="/confidentialite" className="text-forest underline underline-offset-4 decoration-forest/40 hover:decoration-mint">
          {t('form.privacyPolicy')}
        </Link>
        .
      </p>
    </form>
  )
}

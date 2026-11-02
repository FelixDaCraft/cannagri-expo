'use client'

import { useId, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { buttonClasses } from '@/components/ui/ButtonLink'
import { cn } from '@/lib/utils'

/**
 * Inscription aux nouvelles du salon : e-mail + consentement explicite (non coché),
 * puis confirmation par e-mail (double opt-in). `tone` adapte les couleurs au fond.
 */
export function NewsletterForm({ source, tone = 'cream' }: { source: 'footer' | 'programme' | 'billetterie'; tone?: 'cream' | 'night' }) {
  const t = useTranslations('newsletter')
  const locale = useLocale()
  const id = useId()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorKey, setErrorKey] = useState('errors.generic')
  const night = tone === 'night'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!consent) {
      setErrorKey('errors.consent')
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent, website: honeypot, source, locale }),
      })
      if (res.ok) {
        setStatus('sent')
        return
      }
      setErrorKey(res.status === 429 ? 'errors.tooMany' : res.status === 400 ? 'errors.invalid' : 'errors.generic')
      setStatus('error')
    } catch {
      setErrorKey('errors.generic')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <p role="status" className={cn('rounded-[10px] border px-4 py-3 text-base', night ? 'border-cream/25 text-cream' : 'notice-success')}>
        {t('sent')}
      </p>
    )
  }

  const linkClass = night
    ? 'text-cream underline decoration-cream/50 underline-offset-4 hover:decoration-mint'
    : 'text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-mint'

  return (
    <form onSubmit={handleSubmit} noValidate={false} className="space-y-3">
      <label htmlFor={`${id}-email`} className={cn('block font-condensed text-lg font-semibold', night ? 'text-cream' : 'text-forest')}>
        {t('label')}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`${id}-email`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('placeholder')}
          className={cn('field-input sm:flex-1', night && 'border-cream/30 bg-forest-700 text-cream placeholder:text-cream/60 hover:border-cream/60 focus:border-cream')}
        />
        <button type="submit" disabled={status === 'loading'} aria-busy={status === 'loading' || undefined} className={cn(buttonClasses({ size: 'sm' }), 'min-h-[48px] disabled:opacity-60')}>
          {status === 'loading' ? t('sending') : t('submit')}
        </button>
      </div>

      {/* Champ piège : invisible et ignoré par les humains, rempli par les robots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>{t('honeypot')}</label>
        <input id={`${id}-website`} type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <label className={cn('flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-snug', night ? 'text-cream/85' : 'text-ink')}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className={cn('mt-0.5 h-5 w-5 shrink-0 rounded', night ? 'accent-mint' : 'accent-forest')}
        />
        <span>
          {t.rich('consent', { link: (chunks) => <Link href="/confidentialite" className={linkClass}>{chunks}</Link> })}
        </span>
      </label>

      {status === 'error' && (
        <p role="alert" className={night ? 'rounded-[10px] border border-red-300/60 bg-red-950/40 px-4 py-3 text-base text-cream' : 'notice-error'}>
          {t(errorKey)}
        </p>
      )}
    </form>
  )
}

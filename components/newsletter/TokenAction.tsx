'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ButtonLink, buttonClasses } from '@/components/ui/ButtonLink'
import { AuthShell } from '@/components/auth/AuthShell'
import { cn } from '@/lib/utils'

/**
 * Confirmation (automatique à l'ouverture du lien) ou désinscription (un clic sur le bouton,
 * pour qu'un antivirus de messagerie qui ouvre les liens ne désinscrive personne).
 */
export function TokenAction({ action }: { action: 'confirm' | 'unsubscribe' }) {
  const t = useTranslations(`newsletter.${action}`)
  const token = useSearchParams().get('token')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'invalid' | 'expired' | 'error'>(action === 'confirm' ? 'loading' : 'idle')
  const started = useRef(false)

  const run = async () => {
    if (!token) return setStatus('invalid')
    setStatus('loading')
    try {
      const res = await fetch(`/api/newsletter/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) setStatus('done')
      else setStatus(data.status === 'expired' ? 'expired' : res.status === 400 ? 'invalid' : 'error')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    if (action !== 'confirm' || started.current) return
    started.current = true
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const title = status === 'done' ? t('doneTitle') : status === 'invalid' || status === 'expired' || status === 'error' ? t('errorTitle') : t('title')

  return (
    <AuthShell eyebrow={t('eyebrow')} title={title}>
      {status === 'loading' && (
        <div role="status" className="flex items-center gap-4">
          <span aria-hidden="true" className="h-8 w-8 shrink-0 animate-spin rounded-full border-4 border-forest/20 border-t-forest motion-reduce:animate-none" />
          <p className="text-lg text-ink">{t('loading')}</p>
        </div>
      )}
      {status === 'idle' && (
        <>
          <p className="text-lg text-ink">{t('text')}</p>
          <button type="button" onClick={run} className={cn(buttonClasses(), 'mt-6')}>{t('cta')}</button>
        </>
      )}
      {status === 'done' && (
        <>
          <p role="status" className="text-lg text-ink">{t('doneText')}</p>
          <ButtonLink href="/" className="mt-6">{t('home')}</ButtonLink>
        </>
      )}
      {(status === 'invalid' || status === 'expired' || status === 'error') && (
        <>
          <p role="alert" className="text-lg text-ink">{t(status)}</p>
          <ButtonLink href="/programme#restez-informe" className="mt-6" tone="outline-night">{t('again')}</ButtonLink>
        </>
      )}
    </AuthShell>
  )
}

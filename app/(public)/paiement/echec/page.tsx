'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { siteConfig } from '@/config/site'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ResultShell } from '@/components/payment/ResultShell'

const REASONS = ['cancelled', 'expired', 'declined', 'insufficient_funds'] as const

export default function PaymentFailedPage() {
  const t = useTranslations('payment.failed')
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const reasonParam = searchParams.get('reason')
  const reason = REASONS.find((r) => r === reasonParam) ?? 'default'

  return (
    <ResultShell title={t('title')} tone="error">
      <p className="text-lg text-ink">{t(`reasons.${reason}`)}</p>

      {orderId && (
        <p className="mt-4 text-base text-ink">
          {t('reference')} <span className="break-all font-mono text-forest">{orderId}</span>
        </p>
      )}

      <h2 className="mt-8 font-condensed text-2xl font-semibold">{t('whatToDo')}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-ink marker:text-gold-ink">
        {['card', 'other', 'bank', 'charged'].map((key) => (
          <li key={key}>{t(`tips.${key}`)}</li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/billetterie">{t('retry')}</ButtonLink>
        <ButtonLink href="/" tone="outline-night">{t('home')}</ButtonLink>
      </div>

      <p className="mt-8 border-t border-forest/15 pt-5 text-base text-ink">
        {t('help')}{' '}
        <a href={`mailto:${siteConfig.contact.email}`} className="font-medium text-forest underline decoration-forest/40 underline-offset-4">
          {siteConfig.contact.email}
        </a>
      </p>
    </ResultShell>
  )
}

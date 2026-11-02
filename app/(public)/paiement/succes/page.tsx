'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { siteConfig } from '@/config/site'
import { formatTicketPrice } from '@/lib/editions/tickets'
import { ButtonLink, buttonClasses } from '@/components/ui/ButtonLink'
import { ResultShell } from '@/components/payment/ResultShell'

interface OrderDetails {
  id: string
  orderNumber: string
  type: string
  amount: number
  customerName: string
  customerEmail: string
}

type PaymentStatus = 'verifying' | 'success' | 'pending' | 'failed'
type ErrorKey = 'failed' | 'missingParams' | 'verifyError' | 'unknown'

export default function PaymentSuccessPage() {
  const t = useTranslations('payment')
  const searchParams = useSearchParams()
  const { status: sessionStatus } = useSession()

  const orderId = searchParams.get('orderId')
  const vivaOrderCode = searchParams.get('s') || searchParams.get('orderCode')
  const transactionId = searchParams.get('t')
  const isDemo = searchParams.get('demo') === 'true'

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [status, setStatus] = useState<PaymentStatus>('verifying')
  const [errorKey, setErrorKey] = useState<ErrorKey>('unknown')
  const [retryCount, setRetryCount] = useState(0)
  const hasVerified = useRef(false)

  const verifyPayment = useCallback(async () => {
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, vivaOrderCode, transactionId }),
      })
      const data = await res.json()

      if (data.success && data.status === 'PAID') {
        setOrder(data.order)
        setStatus('success')
      } else if (data.status === 'PENDING') {
        setStatus('pending')
      } else if (data.status === 'FAILED') {
        setErrorKey('failed')
        setStatus('failed')
      } else if (data.error) {
        setErrorKey('unknown')
        setStatus('failed')
      }
    } catch {
      setErrorKey('verifyError')
      setStatus('failed')
    }
  }, [orderId, vivaOrderCode, transactionId])

  useEffect(() => {
    if (hasVerified.current) return
    if (!orderId && !vivaOrderCode) {
      setErrorKey('missingParams')
      setStatus('failed')
      return
    }
    hasVerified.current = true
    verifyPayment()
  }, [orderId, vivaOrderCode, verifyPayment])

  useEffect(() => {
    if (status === 'pending' && retryCount < 5) {
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1)
        verifyPayment()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status, retryCount, verifyPayment])

  const help = (
    <p className="mt-8 border-t border-forest/15 pt-5 text-base text-ink">
      {t('question')}{' '}
      <a href={`mailto:${siteConfig.contact.email}`} className="font-medium text-forest underline decoration-forest/40 underline-offset-4">
        {siteConfig.contact.email}
      </a>
    </p>
  )

  if (status === 'verifying' || status === 'pending') {
    return (
      <ResultShell title={status === 'verifying' ? t('verifying.title') : t('pending.title')}>
        <div role="status" className="flex items-center gap-4">
          <span aria-hidden="true" className="h-8 w-8 shrink-0 animate-spin rounded-full border-4 border-forest/20 border-t-forest motion-reduce:animate-none" />
          <p className="text-lg text-ink">{status === 'verifying' ? t('verifying.text') : t('pending.text')}</p>
        </div>
        {status === 'pending' && retryCount > 0 && <p className="mt-3 text-base text-ink">{t('pending.attempt', { count: retryCount })}</p>}
        <p className="mt-6 font-condensed text-lg font-semibold">{t('verifying.keepOpen')}</p>
      </ResultShell>
    )
  }

  if (status === 'failed') {
    return (
      <ResultShell title={t('verifyFailed.title')} tone="error">
        <p className="text-lg text-ink">{t(`verifyFailed.${errorKey}`)}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className={buttonClasses()}
            onClick={() => { setStatus('verifying'); setRetryCount(0); hasVerified.current = false; verifyPayment() }}
          >
            {t('verifyFailed.retry')}
          </button>
          <ButtonLink href="/billetterie" tone="outline-night">{t('verifyFailed.backToTickets')}</ButtonLink>
        </div>
        {help}
      </ResultShell>
    )
  }

  const isTicket = order?.type === 'VISITOR_TICKET'

  return (
    <ResultShell eyebrow={t('success.eyebrow')} title={t('success.title')} tone="success">
      {isDemo && <p className="notice-success mb-6">{t('success.demo')}</p>}

      {order ? (
        <>
          <p className="text-lg leading-relaxed text-ink">
            {t.rich(isTicket ? 'success.thanksTicket' : 'success.thanksStand', {
              email: order.customerEmail,
              strong: (chunks) => <strong className="break-all text-forest">{chunks}</strong>,
            })}
          </p>

          <dl className="mt-6 divide-y divide-forest/15 border-y border-forest/15 font-condensed text-xl">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-ink">{t('success.orderNumber')}</dt>
              <dd className="break-all font-semibold">{order.orderNumber}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-ink">{t('success.amount')}</dt>
              <dd className="font-semibold">{formatTicketPrice(order.amount)}</dd>
            </div>
          </dl>

          <h2 className="mt-8 font-condensed text-2xl font-semibold">{t('success.nextSteps')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-ink marker:text-gold-ink">
            {(isTicket ? ['ticket1', 'ticket2', 'ticket3'] : ['stand1', 'stand2', 'stand3']).map((key) => (
              <li key={key}>{t(`success.steps.${key}`)}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-lg text-ink">{t('success.noDetails')}</p>
      )}

      {isTicket && order && sessionStatus === 'unauthenticated' && (
        <div className="mt-8 rounded-xl border border-forest/20 p-5">
          <h2 className="font-condensed text-xl font-semibold">{t('success.account.title')}</h2>
          <p className="mt-1 text-base text-ink">
            {t.rich('success.account.text', {
              email: order.customerEmail,
              strong: (chunks) => <strong className="break-all text-forest">{chunks}</strong>,
            })}
          </p>
          <Link href={`/inscription?email=${encodeURIComponent(order.customerEmail)}`} className="link-underline text-forest decoration-forest/40">
            {t('success.account.cta')}
          </Link>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">{t('success.home')}</ButtonLink>
        {isTicket && <ButtonLink href="/billetterie" tone="outline-night">{t('success.more')}</ButtonLink>}
      </div>
      {help}
    </ResultShell>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { formatTicketPrice } from '@/lib/editions/tickets'
import { PageHeader } from '@/components/ui/PageHeader'
import { ButtonLink, buttonClasses } from '@/components/ui/ButtonLink'
import { cn } from '@/lib/utils'

interface Ticket {
  id: string
  customerName: string
  ticketType: 'STANDARD' | 'FLEX'
  ticketPrice: number
  status: 'PAID' | 'USED'
  createdAt: string
  scannedAt: string | null
  order: {
    orderNumber: string
    paidAt: string
  }
}

export default function MesBilletsPage() {
  const t = useTranslations('account.tickets')
  const locale = useLocale()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorKey, setErrorKey] = useState<'loadError' | 'downloadError' | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const formatDate = (value: string, withTime = false) =>
    new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
      timeZone: 'Europe/Paris',
    }).format(new Date(value))

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/connexion?callbackUrl=/compte/billets')
  }, [status, router])

  const fetchTickets = useCallback(async () => {
    try {
      const response = await fetch('/api/user/tickets')
      const data = await response.json()
      if (response.status === 403 && data.code === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true)
        return
      }
      if (!response.ok) throw new Error('load')
      setTickets(data.tickets)
    } catch {
      setErrorKey('loadError')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) fetchTickets()
  }, [session, fetchTickets])

  const resendVerification = async () => {
    setResendState('sending')
    try {
      const response = await fetch('/api/auth/resend-verification', { method: 'POST' })
      setResendState(response.ok ? 'sent' : 'error')
    } catch {
      setResendState('error')
    }
  }

  const handleDownload = async (ticketId: string) => {
    setDownloadingId(ticketId)
    setErrorKey(null)
    try {
      const response = await fetch(`/api/user/tickets/${ticketId}`)
      if (!response.ok) throw new Error('download')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `billet-${ticketId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      setErrorKey('downloadError')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
      <PageHeader eyebrow={<Link href="/compte" className="underline decoration-mint/50 underline-offset-4 hover:decoration-mint">{t('back')}</Link>} title={t('title')} lead={t('subtitle')} />
      <div className="bg-cream py-12 text-forest md:py-16">
        <div className="container-custom max-w-4xl">
          {errorKey && <p role="alert" className="notice-error mb-6">{t(errorKey)}</p>}

          {status === 'loading' || isLoading ? (
            <div role="status" className="flex items-center gap-4">
              <span aria-hidden="true" className="h-8 w-8 animate-spin rounded-full border-4 border-forest/20 border-t-forest motion-reduce:animate-none" />
              <span className="text-lg text-ink">{t('loading')}</span>
            </div>
          ) : needsVerification ? (
            <section className="rounded-2xl border-2 border-forest bg-cream-100 p-6 md:p-8">
              <h2 className="font-condensed text-2xl font-semibold">{t('verify.title')}</h2>
              <p className="mt-2 text-lg text-ink">
                {t.rich('verify.text', { email: session?.user?.email ?? '', strong: (chunks) => <strong className="break-all text-forest">{chunks}</strong> })}
              </p>
              {resendState === 'sent' ? (
                <p role="status" className="notice-success mt-6">{t('verify.sent')}</p>
              ) : (
                <button type="button" onClick={resendVerification} disabled={resendState === 'sending'} className={cn(buttonClasses(), 'mt-6 disabled:opacity-60')}>
                  {resendState === 'sending' ? t('verify.sending') : t('verify.cta')}
                </button>
              )}
              {resendState === 'error' && <p role="alert" className="notice-error mt-4">{t('verify.error')}</p>}
            </section>
          ) : tickets.length === 0 ? (
            <section className="rounded-2xl border-2 border-forest bg-cream-100 p-6 md:p-8">
              <h2 className="font-condensed text-2xl font-semibold">{t('empty.title')}</h2>
              <p className="mt-2 text-lg text-ink">{t('empty.text')}</p>
              <ButtonLink href="/billetterie" className="mt-6">{t('empty.cta')}</ButtonLink>
            </section>
          ) : (
            <ul className="space-y-4">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-forest/15 bg-cream-100 p-5 md:flex-row md:items-center">
                  <div className="min-w-0">
                    <p className="font-condensed text-base font-semibold text-gold-ink">
                      {t(`types.${ticket.ticketType}`)} · {ticket.status === 'USED' ? t('status.used') : t('status.valid')}
                    </p>
                    <h2 className="font-condensed text-2xl font-semibold leading-tight">{ticket.customerName}</h2>
                    <p className="mt-1 text-base text-ink">
                      {t('order', { number: ticket.order.orderNumber })} · {formatDate(ticket.order.paidAt)} · {formatTicketPrice(ticket.ticketPrice)}
                    </p>
                    {ticket.scannedAt && <p className="mt-1 text-base text-ink">{t('scannedAt', { date: formatDate(ticket.scannedAt, true) })}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(ticket.id)}
                    disabled={downloadingId === ticket.id}
                    aria-label={t('downloadFor', { name: ticket.customerName })}
                    className={cn(buttonClasses({ tone: 'outline-night', size: 'sm' }), 'shrink-0 disabled:opacity-60')}
                  >
                    {downloadingId === ticket.id ? t('downloading') : t('download')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEdition } from '@/components/editions'
import { Ticket } from '@/components/ui/Ticket'
import { QuantityPicker } from '@/components/ui/QuantityPicker'
import { buttonClasses } from '@/components/ui/ButtonLink'
import { cn } from '@/lib/utils'
import { HONEYPOT_FIELD } from '@/lib/checkout'
import {
  formatTicketPrice,
  MAX_TICKETS_PER_ORDER,
  MAX_TICKETS_PER_TYPE,
  type TicketSelection,
} from '@/lib/editions/tickets'

type TicketType = keyof TicketSelection

const TICKET_TYPES = ['standard', 'flex'] as const

interface Attendee {
  ticketType: TicketType
  name: string
}

/** Liste des participants : un par billet, les noms déjà saisis sont conservés par formule. */
function syncAttendees(prev: Attendee[], quantities: TicketSelection): Attendee[] {
  const byType = (type: TicketType) => prev.filter((a) => a.ticketType === type)
  return (['standard', 'flex'] as const).flatMap((type) => {
    const existing = byType(type)
    return Array.from({ length: quantities[type] }, (_, i) => ({ ticketType: type, name: existing[i]?.name ?? '' }))
  })
}

const FORM_ID = 'ticket-form'

export function TicketForm({ initialSelection }: { initialSelection?: TicketSelection }) {
  const { data: session } = useSession()
  const t = useTranslations('tickets.form')
  const tt = useTranslations('home.tickets')
  const edition = useEdition()
  const prices: TicketSelection = { standard: edition.standardTicketPrice, flex: edition.flexTicketPrice }
  const ticketName = (type: TicketType) => tt(`${type}.name`)

  const [quantities, setQuantities] = useState<TicketSelection>(initialSelection ?? { standard: 0, flex: 0 })
  const [attendees, setAttendees] = useState<Attendee[]>(() =>
    syncAttendees([], initialSelection ?? { standard: 0, flex: 0 })
  )
  const [buyer, setBuyer] = useState({ name: '', email: '', phone: '' })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const totalQuantity = quantities.standard + quantities.flex
  const total = TICKET_TYPES.reduce((sum, type) => sum + prices[type] * quantities[type], 0)

  useEffect(() => {
    setAttendees((prev) => syncAttendees(prev, quantities))
  }, [quantities])

  // Connecté : coordonnées pré-remplies, la commande sera retrouvée dans « Mes billets »
  useEffect(() => {
    if (!session?.user) return
    setBuyer((prev) => ({
      ...prev,
      name: prev.name || session.user.name || '',
      email: prev.email || session.user.email || '',
    }))
  }, [session])

  const setQuantity = (type: TicketType, value: number) => {
    setError('')
    setQuantities((prev) => {
      const next = Math.max(0, Math.min(MAX_TICKETS_PER_TYPE, value))
      const other = type === 'standard' ? prev.flex : prev.standard
      if (next + other > MAX_TICKETS_PER_ORDER) return prev
      return { ...prev, [type]: next }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (totalQuantity === 0) {
      setError(t('errors.noTicket'))
      return
    }
    if (attendees.some((a) => !a.name.trim())) {
      setError(t('errors.attendeeName'))
      return
    }
    if (!acceptTerms) {
      setError(t('errors.terms'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'VISITOR_TICKET',
          // Le serveur recalcule les prix à partir de l'édition
          items: attendees.map((attendee) => ({
            ticketType: attendee.ticketType.toUpperCase(),
            quantity: 1,
            attendeeName: attendee.name.trim(),
          })),
          customer: {
            name: buyer.name.trim(),
            email: buyer.email.trim(),
            phone: buyer.phone.trim(),
            acceptTerms,
            [HONEYPOT_FIELD]: honeypot,
          },
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (response.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      // Les messages du serveur sont en français : on affiche un message traduit selon le cas
      setError(t(response.status === 429 ? 'errors.tooMany' : response.status === 400 ? 'errors.invalid' : 'errors.generic'))
      setIsLoading(false)
    } catch {
      setError(t('errors.network'))
      setIsLoading(false)
    }
  }

  const selectionQuery = `standard=${quantities.standard}&flex=${quantities.flex}`
  const loginHref = `/connexion?callbackUrl=${encodeURIComponent(`/billetterie?${selectionQuery}`)}`
  const ticketCountLabel = t('count', { count: totalQuantity })
  const price = (amount: number) => formatTicketPrice(amount)
  const sectionTitle = 'font-condensed text-[1.75rem] font-semibold leading-tight text-forest'
  const linkClass = 'font-medium text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-mint'

  return (
    <form id={FORM_ID} onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-3">
      <div className="min-w-0 space-y-12 lg:col-span-2">
        {/* 1. Choix des billets */}
        <section aria-labelledby="ticket-choice-title">
          <h2 id="ticket-choice-title" className={sectionTitle}>{t('step1')}</h2>
          <div className="mt-5 space-y-6">
            {TICKET_TYPES.map((type) => (
              <Ticket
                key={type}
                as="div"
                className={cn('w-full', quantities[type] > 0 && 'outline outline-[3px] outline-offset-4 outline-mint')}
                name={ticketName(type)}
                price={prices[type]}
                unit={tt('unit')}
                tone={type === 'flex' ? 'flex' : 'night'}
                tag={type === 'flex' ? tt('flex.tag') : undefined}
                description={
                  type === 'flex' && prices.flex > prices.standard
                    ? t('flexDescription', { amount: price(prices.flex - prices.standard) })
                    : tt(`${type}.description`)
                }
                meta={tt('meta')}
              >
                <QuantityPicker
                  name={ticketName(type)}
                  value={quantities[type]}
                  onChange={(value) => setQuantity(type, value)}
                  max={Math.min(MAX_TICKETS_PER_TYPE, MAX_TICKETS_PER_ORDER - (totalQuantity - quantities[type]))}
                />
              </Ticket>
            ))}
          </div>
          <p className="mt-5 font-condensed text-lg font-medium text-ink">{t('reassurance')}</p>
        </section>

        {totalQuantity > 0 && (
          <>
            {/* 2. Participants */}
            <section aria-labelledby="attendees-title">
              <h2 id="attendees-title" className={sectionTitle}>{t('step2')}</h2>
              <p className="mb-5 mt-2 text-base text-ink">{t('attendeesHint')}</p>
              <div className="space-y-4">
                {attendees.map((attendee, index) => (
                  <div key={`${attendee.ticketType}-${index}`}>
                    <label htmlFor={`attendee-name-${index}`} className="field-label">
                      {t('attendee', { number: index + 1 })}{' '}
                      <span className="font-body text-base font-normal text-ink">· {ticketName(attendee.ticketType)}</span>
                    </label>
                    <input
                      type="text"
                      id={`attendee-name-${index}`}
                      name={`attendee-name-${index}`}
                      autoComplete={index === 0 ? 'name' : 'off'}
                      value={attendee.name}
                      maxLength={100}
                      onChange={(e) => {
                        const next = [...attendees]
                        next[index] = { ...next[index], name: e.target.value }
                        setAttendees(next)
                      }}
                      placeholder={t('attendeePlaceholder')}
                      className="field-input"
                      required
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Coordonnées */}
            <section aria-labelledby="buyer-title">
              <h2 id="buyer-title" className={sectionTitle}>{t('step3')}</h2>
              {session?.user ? (
                <p className="mb-5 mt-2 text-base text-ink">{t.rich('loggedInAs', { email: session.user.email ?? '', strong: (chunks) => <strong className="text-forest">{chunks}</strong> })}</p>
              ) : (
                <p className="mb-5 mt-2 text-base text-ink">
                  {t('noAccount')}{' '}
                  <Link href={loginHref} className={linkClass}>{t('haveAccount')}</Link>
                </p>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="buyer-name" className="field-label">{t('buyerName')}</label>
                  <input
                    type="text"
                    id="buyer-name"
                    name="name"
                    autoComplete="name"
                    value={buyer.name}
                    minLength={2}
                    maxLength={100}
                    onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                    className="field-input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="buyer-email" className="field-label">{t('buyerEmail')}</label>
                  <input
                    type="email"
                    id="buyer-email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    value={buyer.email}
                    maxLength={254}
                    onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                    className="field-input"
                    aria-describedby="buyer-email-hint"
                    required
                  />
                  <p id="buyer-email-hint" className="field-hint">{t('buyerEmailHint')}</p>
                </div>
                <div>
                  <label htmlFor="buyer-phone" className="field-label">
                    {t('buyerPhone')} <span className="font-body text-base font-normal text-ink">{t('optional')}</span>
                  </label>
                  <input
                    type="tel"
                    id="buyer-phone"
                    name="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={buyer.phone}
                    maxLength={30}
                    onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                    className="field-input"
                  />
                </div>
              </div>

              {/* Champ piège : invisible et ignoré par les humains, rempli par les robots */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="ticket-website">{t('honeypot')}</label>
                <input
                  type="text"
                  id="ticket-website"
                  name={HONEYPOT_FIELD}
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <label className="mt-6 flex cursor-pointer items-start gap-3 text-base text-forest">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-6 w-6 flex-shrink-0 rounded border-forest/50 accent-forest"
                  required
                />
                <span>
                  {t.rich('terms', {
                    cgv: (chunks) => <Link href="/cgv" target="_blank" className={linkClass}>{chunks}</Link>,
                  })}
                </span>
              </label>
              <p className="mt-3 text-base text-ink">
                {t('privacy')}{' '}
                <Link href="/confidentialite" className={linkClass}>{t('privacyLink')}</Link>
              </p>
            </section>

            {error && <p role="alert" className="notice-error">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading || undefined}
              className={cn(buttonClasses({ size: 'lg' }), 'hidden w-full disabled:opacity-60 lg:inline-flex')}
            >
              {isLoading ? t('redirecting') : t('pay', { total: price(total) })}
            </button>
          </>
        )}
      </div>

      {/* Récapitulatif (ordinateur) */}
      <aside className="hidden lg:col-span-1 lg:block" aria-label={t('summary')}>
        <div className="sticky top-24 rounded-2xl border-2 border-forest bg-cream-100 p-6">
          <h2 className="font-condensed text-2xl font-semibold text-forest">{t('summary')}</h2>
          {totalQuantity > 0 ? (
            <>
              <dl className="mt-4 space-y-3">
                {TICKET_TYPES.filter((type) => quantities[type] > 0).map((type) => (
                  <div key={type} className="flex justify-between gap-4 text-ink">
                    <dt>{ticketName(type)} × {quantities[type]}</dt>
                    <dd className="font-medium text-forest">{price(prices[type] * quantities[type])}</dd>
                  </div>
                ))}
                <div className="flex justify-between border-t border-forest/15 pt-4 font-condensed text-2xl font-semibold text-forest">
                  <dt>{t('total')}</dt>
                  <dd>{price(total)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-base text-ink">{t('summaryNote')}</p>
            </>
          ) : (
            <p className="py-8 text-center text-ink">{t('selectTickets')}</p>
          )}
        </div>
      </aside>

      {/* Barre de paiement fixe (mobile et tablette) */}
      {totalQuantity > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-forest pb-[env(safe-area-inset-bottom)] text-cream lg:hidden">
          <div className="container-custom flex items-center justify-between gap-3 py-3">
            <p className="min-w-0 font-condensed text-xl" aria-live="polite">
              <span className="font-semibold">{ticketCountLabel}</span>
              <span aria-hidden="true"> · </span>
              <span className="sr-only">, {t('total')} </span>
              <span className="font-semibold text-mint">{price(total)}</span>
            </p>
            <button
              type="submit"
              form={FORM_ID}
              disabled={isLoading}
              aria-busy={isLoading || undefined}
              className={cn(buttonClasses({ size: 'sm' }), 'flex-shrink-0 disabled:opacity-60')}
            >
              {isLoading ? t('redirecting') : t('payShort')}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}

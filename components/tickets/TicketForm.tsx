'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { siteConfig } from '@/config/site'
import { useEdition } from '@/components/editions'
import { HONEYPOT_FIELD } from '@/lib/checkout'
import {
  formatTicketPrice,
  MAX_TICKETS_PER_ORDER,
  MAX_TICKETS_PER_TYPE,
  type TicketSelection,
} from '@/lib/editions/tickets'

type TicketType = keyof TicketSelection

interface TicketOption {
  type: TicketType
  name: string
  price: number
  description: string
  badge?: string
}

// Les prix viennent de l'édition en ligne (le serveur les recalcule de toute façon)
function getTicketOptions(prices: { standardTicketPrice: number; flexTicketPrice: number }): TicketOption[] {
  const support = prices.flexTicketPrice - prices.standardTicketPrice
  return [
    {
      type: 'standard',
      name: siteConfig.tickets.standard.name,
      price: prices.standardTicketPrice,
      description: siteConfig.tickets.standard.description,
    },
    {
      type: 'flex',
      name: siteConfig.tickets.flex.name,
      price: prices.flexTicketPrice,
      description:
        support > 0
          ? `Les mêmes accès que le Standard, dont ${formatTicketPrice(support)} de soutien à l'association`
          : siteConfig.tickets.flex.description,
      badge: 'Soutien',
    },
  ]
}

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

const inputClasses =
  'w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-forest focus:border-transparent'

const FORM_ID = 'ticket-form'

export function TicketForm({ initialSelection }: { initialSelection?: TicketSelection }) {
  const { data: session } = useSession()
  const ticketOptions = getTicketOptions(useEdition())

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
  const total = ticketOptions.reduce((sum, ticket) => sum + ticket.price * quantities[ticket.type], 0)
  const getTicketOption = (type: TicketType) => ticketOptions.find((t) => t.type === type)!

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

  const changeQuantity = (type: TicketType, delta: number) => {
    setError('')
    setQuantities((prev) => {
      const next = Math.max(0, Math.min(MAX_TICKETS_PER_TYPE, prev[type] + delta))
      const other = type === 'standard' ? prev.flex : prev.standard
      if (next + other > MAX_TICKETS_PER_ORDER) return prev
      return { ...prev, [type]: next }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (totalQuantity === 0) {
      setError('Choisissez au moins un billet')
      return
    }
    if (attendees.some((a) => !a.name.trim())) {
      setError('Indiquez le nom de chaque participant')
      return
    }
    if (!acceptTerms) {
      setError('Vous devez accepter les conditions générales de vente')
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
      if (!response.ok) throw new Error(data.error || 'Une erreur est survenue, veuillez réessayer.')

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      throw new Error('Une erreur est survenue, veuillez réessayer.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue, veuillez réessayer.')
      setIsLoading(false)
    }
  }

  const selectionQuery = `standard=${quantities.standard}&flex=${quantities.flex}`
  const loginHref = `/connexion?callbackUrl=${encodeURIComponent(`/billetterie?${selectionQuery}`)}`
  const ticketCountLabel = `${totalQuantity} billet${totalQuantity > 1 ? 's' : ''}`

  return (
    <form id={FORM_ID} onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-10 min-w-0">
        {/* 1. Choix des billets */}
        <section aria-labelledby="ticket-choice-title">
          <h2 id="ticket-choice-title" className="text-2xl font-heading font-bold text-heading mb-4">
            1. Choisissez vos billets
          </h2>
          <div className="space-y-4">
            {ticketOptions.map((ticket) => {
              const qty = quantities[ticket.type]
              return (
                <Card
                  key={ticket.type}
                  variant={qty > 0 ? 'bordered' : 'default'}
                  className={`transition-all ${qty > 0 ? 'ring-2 ring-forest border-forest' : ''}`}
                >
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-heading font-semibold text-heading">{ticket.name}</h3>
                          {ticket.badge && (
                            <Badge variant="terracotta" className="text-xs">
                              {ticket.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-forest mb-1">{formatTicketPrice(ticket.price)}</p>
                        <p className="text-sm text-body/80">{ticket.description}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0" role="group" aria-label={`Quantité ${ticket.name}`}>
                        <button
                          type="button"
                          className="w-11 h-11 rounded-lg border border-gray-300 bg-white text-xl leading-none flex items-center justify-center hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest disabled:opacity-40"
                          onClick={() => changeQuantity(ticket.type, -1)}
                          disabled={qty === 0}
                          aria-label={`Retirer un ${ticket.name}`}
                        >
                          −
                        </button>
                        <output className="text-xl font-semibold w-8 text-center" aria-live="polite">
                          {qty}
                        </output>
                        <button
                          type="button"
                          className="w-11 h-11 rounded-lg border border-gray-300 bg-white text-xl leading-none flex items-center justify-center hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest disabled:opacity-40"
                          onClick={() => changeQuantity(ticket.type, 1)}
                          disabled={qty >= MAX_TICKETS_PER_TYPE}
                          aria-label={`Ajouter un ${ticket.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {totalQuantity > 0 && (
          <>
            {/* 2. Participants */}
            <section aria-labelledby="attendees-title">
              <h2 id="attendees-title" className="text-2xl font-heading font-bold text-heading mb-2">
                2. Nom des participants
              </h2>
              <p className="text-sm text-body/80 mb-4">
                Chaque billet est nominatif : le nom est imprimé sur le billet et vérifié à l&apos;entrée.
              </p>
              <div className="space-y-3">
                {attendees.map((attendee, index) => (
                  <div key={`${attendee.ticketType}-${index}`}>
                    <label
                      htmlFor={`attendee-name-${index}`}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"
                    >
                      Participant {index + 1}
                      <span className="text-body/60 font-normal">· {getTicketOption(attendee.ticketType).name}</span>
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
                      placeholder="Prénom et nom"
                      className={inputClasses}
                      required
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Coordonnées */}
            <section aria-labelledby="buyer-title">
              <h2 id="buyer-title" className="text-2xl font-heading font-bold text-heading mb-2">
                3. Vos coordonnées
              </h2>
              {session?.user ? (
                <p className="text-sm text-body/80 mb-4">
                  Connecté en tant que <strong>{session.user.email}</strong> : vos billets seront aussi dans « Mes billets ».
                </p>
              ) : (
                <p className="text-sm text-body/80 mb-4">
                  Pas besoin de compte : les billets sont envoyés à cette adresse e-mail.{' '}
                  <Link href={loginHref} className="text-forest font-medium underline underline-offset-2">
                    J&apos;ai déjà un compte
                  </Link>
                </p>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="buyer-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom et prénom
                  </label>
                  <input
                    type="text"
                    id="buyer-name"
                    name="name"
                    autoComplete="name"
                    value={buyer.name}
                    minLength={2}
                    maxLength={100}
                    onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="buyer-email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="buyer-email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    value={buyer.email}
                    maxLength={254}
                    onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                    className={inputClasses}
                    aria-describedby="buyer-email-hint"
                    required
                  />
                  <p id="buyer-email-hint" className="text-xs text-body/70 mt-1">
                    Vos e-billets et votre facture arrivent ici.
                  </p>
                </div>
                <div>
                  <label htmlFor="buyer-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone <span className="text-body/60 font-normal">(facultatif)</span>
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
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Champ piège : invisible et ignoré par les humains, rempli par les robots */}
              <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label htmlFor="ticket-website">Ne pas remplir</label>
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

              <label className="mt-6 flex items-start gap-3 text-sm text-body cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-5 w-5 flex-shrink-0 rounded border-gray-400 text-forest focus:ring-forest"
                  required
                />
                <span>
                  J&apos;accepte les{' '}
                  <Link href="/cgv" target="_blank" className="text-forest font-medium underline underline-offset-2">
                    conditions générales de vente
                  </Link>
                  . Les billets ne sont ni échangeables ni remboursables, sauf annulation de l&apos;événement.
                </span>
              </label>
              <p className="mt-3 text-xs text-body/70">
                Vos coordonnées servent uniquement à vous envoyer vos billets et votre facture.{' '}
                <Link href="/confidentialite" className="underline underline-offset-2">
                  Politique de confidentialité
                </Link>
              </p>
            </section>

            {error && (
              <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full hidden lg:inline-flex" isLoading={isLoading}>
              Payer {formatTicketPrice(total)}
            </Button>
          </>
        )}
      </div>

      {/* Récapitulatif (ordinateur) */}
      <aside className="hidden lg:block lg:col-span-1" aria-label="Récapitulatif de la commande">
        <Card variant="bordered" className="sticky top-24">
          <CardContent>
            <h3 className="text-xl font-heading font-semibold text-heading mb-4">Récapitulatif</h3>
            {totalQuantity > 0 ? (
              <>
                <div className="space-y-3 mb-4">
                  {ticketOptions.map((ticket) => {
                    const qty = quantities[ticket.type]
                    if (qty === 0) return null
                    return (
                      <div key={ticket.type} className="flex justify-between gap-4">
                        <span className="text-body/80">
                          {ticket.name} × {qty}
                        </span>
                        <span>{formatTicketPrice(ticket.price * qty)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-semibold">
                  <span>Total TTC</span>
                  <span className="text-forest">{formatTicketPrice(total)}</span>
                </div>
                <p className="mt-4 text-sm text-body/70">
                  Paiement sécurisé par Viva Wallet. Un e-billet nominatif par participant.
                </p>
              </>
            ) : (
              <p className="text-body/70 text-center py-8">Sélectionnez vos billets</p>
            )}
          </CardContent>
        </Card>
      </aside>

      {/* Barre de paiement fixe (mobile et tablette) */}
      {totalQuantity > 0 && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-forest/15 bg-white/95 backdrop-blur shadow-[0_-4px_16px_rgba(29,43,58,0.12)] pb-[env(safe-area-inset-bottom)]">
          <div className="container-custom flex items-center justify-between gap-3 py-3">
            <p className="text-sm text-body min-w-0" aria-live="polite">
              <span className="font-semibold">{ticketCountLabel}</span>
              <span aria-hidden="true"> · </span>
              <span className="sr-only">, total </span>
              <span className="font-bold text-forest">{formatTicketPrice(total)}</span>
            </p>
            <Button type="submit" form={FORM_ID} isLoading={isLoading} className="min-h-[44px] flex-shrink-0">
              Payer
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}

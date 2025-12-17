'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui'
import { siteConfig } from '@/config/site'

interface TicketType {
  id: string
  price: number
  popular?: boolean
}

const ticketTypesData: TicketType[] = [
  {
    id: 'standard',
    price: 15,
  },
  {
    id: 'flex',
    price: 25,
    popular: true,
  },
]

function TicketCard({ ticket, quantity, onQuantityChange, t }: {
  ticket: TicketType
  quantity: number
  onQuantityChange: (qty: number) => void
  t: ReturnType<typeof useTranslations>
}) {
  const ticketKey = ticket.id as 'standard' | 'flex'
  const features = [
    t(`${ticketKey}.features.stands`),
    t(`${ticketKey}.features.conferences`),
    t(`${ticketKey}.features.badge`),
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl h-full ${
        ticket.popular ? 'ring-2 ring-terracotta' : ''
      }`}
    >
      {ticket.popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-terracotta text-cream text-xs font-bold px-4 py-1 rounded-bl-lg">
            {t('flex.badge')}
          </div>
        </div>
      )}

      <div className="p-6 h-full flex flex-col">
        <h3 className="text-xl font-heading font-bold text-forest mb-2">
          {t(`${ticketKey}.name`)}
        </h3>
        <p className="text-forest/60 text-sm mb-4">{t(`${ticketKey}.description`)}</p>

        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-4xl font-heading font-bold text-forest">
            {ticket.price}
          </span>
          <span className="text-forest/60">EUR</span>
        </div>

        <ul className="space-y-3 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-forest/80">
              <svg className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <div className={`mb-4 p-3 rounded-lg border ${ticket.id === 'standard' ? 'bg-sage/10 border-sage/20' : 'bg-terracotta/10 border-terracotta/20'}`}>
          <div className="flex items-start gap-2">
            {ticket.id === 'standard' ? (
              <svg className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
            <p className={`text-xs ${ticket.id === 'standard' ? 'text-forest' : 'text-terracotta/90'}`}>{t(`${ticketKey}.supportMessage`)}</p>
          </div>
        </div>

        {/* Spacer to push quantity selector to bottom */}
        <div className="flex-grow"></div>

        {/* Quantity selector */}
        <div className="flex items-center justify-between bg-cream/50 rounded-xl p-3 mt-auto">
          <span className="text-sm font-medium text-forest">{t('quantity')}</span>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center hover:bg-forest/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </motion.button>
            <span className="w-8 text-center font-heading font-bold text-forest">
              {quantity}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center hover:bg-forest/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function TicketSection() {
  const t = useTranslations('home.tickets')
  const [quantities, setQuantities] = useState<Record<string, number>>({
    standard: 0,
    flex: 0,
  })

  const updateQuantity = (ticketId: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [ticketId]: qty }))
  }

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0)
  const totalPrice = ticketTypesData.reduce((total, ticket) => {
    return total + (ticket.price * (quantities[ticket.id] || 0))
  }, 0)

  return (
    <section className="py-20 bg-gradient-to-b from-cream to-mint/10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-mint/20 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl translate-x-1/2" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-forest/10 text-forest font-medium rounded-full text-sm mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            {t('badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-4">
            {t('title')}
          </h2>
          <p className="text-forest/70 max-w-2xl mx-auto">
            {t('subtitle', { date: siteConfig.event.date, location: siteConfig.event.location, city: siteConfig.event.city })}
          </p>
        </motion.div>

        {/* Ticket cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
          {ticketTypesData.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              quantity={quantities[ticket.id]}
              onQuantityChange={(qty) => updateQuantity(ticket.id, qty)}
              t={t}
            />
          ))}
        </div>

        {/* Summary and CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-forest rounded-2xl p-6 md:p-8 shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-cream/70 text-sm mb-1">{t('yourSelection')}</p>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl md:text-4xl font-heading font-bold text-cream">
                  {totalPrice} EUR
                </span>
                {totalTickets > 0 && (
                  <span className="text-cream/60 text-sm">
                    ({totalTickets} {totalTickets > 1 ? t('tickets') : t('ticket')})
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {totalTickets > 0 ? (
                <Link href={`/billetterie?${Object.entries(quantities).filter(([_, qty]) => qty > 0).map(([id, qty]) => `${id}=${qty}`).join('&')}`}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="bg-terracotta hover:bg-terracotta-600 text-white shadow-lg shadow-terracotta/30"
                    >
                      {t('proceedPayment')}
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </motion.div>
                </Link>
              ) : (
                <Link href="/billetterie">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-cream/30 text-cream hover:bg-cream/10"
                    >
                      {t('seeAllOptions')}
                    </Button>
                  </motion.div>
                </Link>
              )}
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-6 pt-6 border-t border-cream/10 flex flex-wrap justify-center gap-6 text-sm text-cream/60">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {t('securePayment')}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('eTicket')}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('refundable')}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

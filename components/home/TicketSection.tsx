'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Button } from '@/components/ui'
import { siteConfig } from '@/config/site'

interface TicketType {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
}

const ticketTypes: TicketType[] = [
  {
    id: 'visiteur',
    name: 'Visiteur',
    price: 15,
    description: 'Accès au salon toute la journée',
    features: [
      'Accès aux stands exposants',
      'Accès aux conférences (selon disponibilité)',
      'Badge visiteur',
    ],
  },
  {
    id: 'pro',
    name: 'Pass Pro',
    price: 25,
    description: 'Accès privilégié professionnel',
    features: [
      'Accès prioritaire au salon',
      'Accès à toutes les conférences',
      'Badge professionnel',
      'Accès espace networking',
      'Documentation professionnelle',
    ],
    popular: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 75,
    description: 'Expérience VIP complète',
    features: [
      'Tous les avantages Pass Pro',
      'Cocktail networking exclusif',
      'Goodies premium',
      'Accès backstage',
      'Place réservée conférences',
    ],
  },
]

function TicketCard({ ticket, quantity, onQuantityChange }: {
  ticket: TicketType
  quantity: number
  onQuantityChange: (qty: number) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl ${
        ticket.popular ? 'ring-2 ring-terracotta' : ''
      }`}
    >
      {ticket.popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-terracotta text-cream text-xs font-bold px-4 py-1 rounded-bl-lg">
            POPULAIRE
          </div>
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-heading font-bold text-forest mb-2">
          {ticket.name}
        </h3>
        <p className="text-forest/60 text-sm mb-4">{ticket.description}</p>

        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-4xl font-heading font-bold text-forest">
            {ticket.price}
          </span>
          <span className="text-forest/60">EUR</span>
        </div>

        <ul className="space-y-3 mb-6">
          {ticket.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-forest/80">
              <svg className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {/* Quantity selector */}
        <div className="flex items-center justify-between bg-cream/50 rounded-xl p-3">
          <span className="text-sm font-medium text-forest">Quantité</span>
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
  const [quantities, setQuantities] = useState<Record<string, number>>({
    visiteur: 0,
    pro: 0,
    vip: 0,
  })

  const updateQuantity = (ticketId: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [ticketId]: qty }))
  }

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0)
  const totalPrice = ticketTypes.reduce((total, ticket) => {
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
            Billetterie
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-4">
            Réservez vos billets
          </h2>
          <p className="text-forest/70 max-w-2xl mx-auto">
            Choisissez la formule qui vous convient et rejoignez-nous le {siteConfig.event.date} à {siteConfig.event.location}, {siteConfig.event.city}.
          </p>
        </motion.div>

        {/* Ticket cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {ticketTypes.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              quantity={quantities[ticket.id]}
              onQuantityChange={(qty) => updateQuantity(ticket.id, qty)}
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
              <p className="text-cream/70 text-sm mb-1">Votre sélection</p>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl md:text-4xl font-heading font-bold text-cream">
                  {totalPrice} EUR
                </span>
                {totalTickets > 0 && (
                  <span className="text-cream/60 text-sm">
                    ({totalTickets} billet{totalTickets > 1 ? 's' : ''})
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
                      Procéder au paiement
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
                      Voir toutes les options
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
              Paiement sécurisé
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              E-billet par email
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Remboursable 48h avant
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

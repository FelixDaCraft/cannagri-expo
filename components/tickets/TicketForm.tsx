'use client'

import { useState } from 'react'
import { Button, Input, Card, CardContent, Badge } from '@/components/ui'
import { siteConfig } from '@/config/site'
import { formatPrice } from '@/lib/utils'

interface TicketOption {
  type: 'visiteur' | 'pro' | 'vip'
  name: string
  price: number
  description: string
}

const ticketOptions: TicketOption[] = [
  {
    type: 'visiteur',
    name: siteConfig.tickets.visiteur.name,
    price: siteConfig.tickets.visiteur.price,
    description: siteConfig.tickets.visiteur.description,
  },
  {
    type: 'pro',
    name: siteConfig.tickets.pro.name,
    price: siteConfig.tickets.pro.price,
    description: siteConfig.tickets.pro.description,
  },
  {
    type: 'vip',
    name: siteConfig.tickets.vip.name,
    price: siteConfig.tickets.vip.price,
    description: siteConfig.tickets.vip.description,
  },
]

export function TicketForm() {
  const [selectedTicket, setSelectedTicket] = useState<TicketOption | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'VISITOR_TICKET',
          items: [
            {
              ticketType: selectedTicket.type.toUpperCase(),
              price: selectedTicket.price,
              quantity,
            },
          ],
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      // Redirect to Viva Wallet checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const total = selectedTicket ? selectedTicket.price * quantity : 0

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Ticket Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-heading mb-4">
            1. Choisissez votre pass
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {ticketOptions.map((ticket) => (
              <Card
                key={ticket.type}
                variant={selectedTicket?.type === ticket.type ? 'bordered' : 'default'}
                className={`cursor-pointer transition-all ${
                  selectedTicket?.type === ticket.type
                    ? 'ring-2 ring-forest border-forest'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent className="text-center">
                  {ticket.type === 'vip' && (
                    <Badge variant="forest" className="mb-2">Premium</Badge>
                  )}
                  <h3 className="text-lg font-heading font-semibold text-heading mb-1">
                    {ticket.name}
                  </h3>
                  <p className="text-2xl font-bold text-forest mb-2">
                    {formatPrice(ticket.price)}
                  </p>
                  <p className="text-sm text-body/70">{ticket.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {selectedTicket && (
          <>
            <div>
              <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                2. Quantité
              </h2>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  type="button"
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                3. Vos coordonnées
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nom complet"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  helperText="Votre billet sera envoyé à cette adresse"
                />
                <Input
                  label="Téléphone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                  Procéder au paiement
                </Button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card variant="bordered" className="sticky top-24">
          <CardContent>
            <h3 className="text-xl font-heading font-semibold text-heading mb-4">
              Récapitulatif
            </h3>

            {selectedTicket ? (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-body/70">{selectedTicket.name}</span>
                    <span>{formatPrice(selectedTicket.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body/70">Quantité</span>
                    <span>x {quantity}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total TTC</span>
                    <span className="text-forest">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-cream rounded-lg">
                  <div className="flex items-start gap-2 text-sm text-body/70">
                    <svg className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>
                      Paiement sécurisé par Viva Wallet. Vous recevrez votre e-billet avec QR code par email.
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-body/50 text-center py-8">
                Sélectionnez un type de billet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

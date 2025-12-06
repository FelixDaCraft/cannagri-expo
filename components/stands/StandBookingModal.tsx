'use client'

import { useState } from 'react'
import { Modal, Button, Input, Badge } from '@/components/ui'
import { formatPrice } from '@/lib/utils'

interface Stand {
  id: string
  code: string
  surfaceM2: number
  priceHT: number
  status: string
}

interface StandBookingModalProps {
  stand: Stand
  isOpen: boolean
  onClose: () => void
}

export function StandBookingModal({ stand, isOpen, onClose }: StandBookingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    siret: '',
    address: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'STAND_BOOKING',
          items: {
            standId: stand.id,
          },
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            companyName: formData.company,
            siret: formData.siret,
            address: formData.address,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', company: '', siret: '', address: '' })
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Réserver le Stand ${stand.code}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Stand Info */}
        <div className="bg-cream rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <Badge variant="forest">Stand {stand.code}</Badge>
              <span className="ml-2 text-sm text-body/60">{stand.surfaceM2} m²</span>
            </div>
            <span className="font-heading font-bold text-forest">{formatPrice(stand.priceHT)} HT</span>
          </div>
          <p className="text-sm text-body/60 mt-2">
            Besoin de plus d&apos;espace ? Réservez plusieurs stands côte à côte.
          </p>
        </div>

        <Input
          label="Nom du responsable"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="Email professionnel"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label="Téléphone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        <Input
          label="Raison sociale"
          name="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          required
        />

        <Input
          label="SIRET"
          name="siret"
          value={formData.siret}
          onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
          required
          helperText="14 chiffres"
        />

        <Input
          label="Adresse de facturation"
          name="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            Procéder au paiement
          </Button>
        </div>
      </form>
    </Modal>
  )
}

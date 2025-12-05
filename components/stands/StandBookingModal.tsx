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
  hasFurniture: boolean
  hasElectricity: boolean
  furniturePrice: number
  electricityPrice: number
}

interface StandBookingModalProps {
  stand: Stand
  isOpen: boolean
  onClose: () => void
}

export function StandBookingModal({ stand, isOpen, onClose }: StandBookingModalProps) {
  const [step, setStep] = useState<'options' | 'details'>('options')
  const [options, setOptions] = useState({
    furniture: false,
    electricity: false,
  })
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

  const totalPrice = stand.priceHT +
    (options.furniture ? stand.furniturePrice : 0) +
    (options.electricity ? stand.electricityPrice : 0)

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
            hasFurniture: options.furniture,
            hasElectricity: options.electricity,
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
    setStep('options')
    setOptions({ furniture: false, electricity: false })
    setFormData({ name: '', email: '', phone: '', company: '', siret: '', address: '' })
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Stand ${stand.code}`} size="lg">
      {step === 'options' ? (
        <div className="space-y-6">
          {/* Stand Info */}
          <div className="bg-cream rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-body/60">Surface</span>
                <p className="font-semibold">{stand.surfaceM2} m²</p>
              </div>
              <div>
                <span className="text-body/60">Prix de base HT</span>
                <p className="font-semibold">{formatPrice(stand.priceHT)}</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div>
            <h3 className="font-heading font-semibold text-heading mb-3">
              Options disponibles
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-sage transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={options.furniture}
                    onChange={(e) => setOptions({ ...options, furniture: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-forest focus:ring-sage"
                  />
                  <div>
                    <p className="font-medium">Mobilier</p>
                    <p className="text-sm text-body/60">Table, chaises, présentoir</p>
                  </div>
                </div>
                <span className="font-semibold">+{formatPrice(stand.furniturePrice)}</span>
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-sage transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={options.electricity}
                    onChange={(e) => setOptions({ ...options, electricity: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-forest focus:ring-sage"
                  />
                  <div>
                    <p className="font-medium">Électricité</p>
                    <p className="text-sm text-body/60">Prise 220V standard</p>
                  </div>
                </div>
                <span className="font-semibold">+{formatPrice(stand.electricityPrice)}</span>
              </label>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-heading font-semibold">Total HT</span>
              <span className="font-heading font-bold text-forest">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-sm text-body/60 mt-1">TVA 20% applicable</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Annuler
            </Button>
            <Button onClick={() => setStep('details')} className="flex-1">
              Continuer
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-cream rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <Badge variant="forest">Stand {stand.code}</Badge>
                <span className="ml-2 text-sm text-body/60">{stand.surfaceM2} m²</span>
              </div>
              <span className="font-heading font-bold text-forest">{formatPrice(totalPrice)} HT</span>
            </div>
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
            <Button type="button" variant="outline" onClick={() => setStep('options')} className="flex-1">
              Retour
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              Procéder au paiement
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

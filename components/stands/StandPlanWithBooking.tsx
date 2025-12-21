'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { InteractiveStandPlan } from './InteractiveStandPlan'
import { Modal, Button, Input, Badge } from '@/components/ui'

interface Stand {
  id: number
  name: string
  position: { gridColumn: number; gridRow: number }
  location: string
  surface: number
  price: number
  currency: string
  status: 'available' | 'reserved' | 'sold' | 'blocked'
  category: 'standard' | 'premium' | 'corner'
  amenities: string[]
  reservedBy: string | null
  reservedAt: string | null
}

interface UserProfile {
  name: string | null
  email: string
  phone: string | null
  companyName: string | null
  siret: string | null
}

export function StandPlanWithBooking() {
  const { data: session } = useSession()
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
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

  // Fetch user profile on mount
  useEffect(() => {
    async function fetchUserProfile() {
      if (!session?.user?.id) return

      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
          // Pre-fill form with user data
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            company: data.companyName || '',
            siret: data.siret || '',
            address: '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      }
    }

    fetchUserProfile()
  }, [session?.user?.id])

  const handleReserve = (stand: Stand) => {
    console.log('[StandPlanWithBooking] handleReserve called with stand:', stand)
    setSelectedStand(stand)
    setIsModalOpen(true)
    console.log('[StandPlanWithBooking] Modal should now be open')
  }

  const handleClose = () => {
    setIsModalOpen(false)
    // Reset to user profile data when closing
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        company: userProfile.companyName || '',
        siret: userProfile.siret || '',
        address: '',
      })
    }
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStand) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'STAND_BOOKING',
          items: {
            standId: selectedStand.id.toString(),
            standCode: selectedStand.name,
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

  return (
    <>
      <InteractiveStandPlan onReserve={handleReserve} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={`Réserver le ${selectedStand?.name || 'Stand'}`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stand Info */}
          {selectedStand && (
            <div className="bg-cream rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <Badge variant="forest">{selectedStand.name}</Badge>
                  <span className="ml-2 text-sm text-body/60">{selectedStand.surface} m²</span>
                </div>
                <span className="font-heading font-bold text-forest">{selectedStand.price} €</span>
              </div>
              <p className="text-xs text-forest/70 mt-1">
                Mobilier (tables & chaises) + Électricité inclus
              </p>
              <p className="text-sm text-body/60 mt-2">
                Emplacement : {selectedStand.location}
              </p>
            </div>
          )}

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
    </>
  )
}

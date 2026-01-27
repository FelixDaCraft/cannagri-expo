'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Button, Input } from '@/components/ui'

interface InfosPratiques {
  eventDate: string
  eventTime: string
  eventLocation: string
  eventAddress: string
  eventCity: string
  accessTransport: string
  accessParking: string
  accessInfo: string
  ticketInfo: string
  contactEmail: string
  contactPhone: string
}

export default function AdminInfosPratiquesPage() {
  const [infos, setInfos] = useState<InfosPratiques>({
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    eventAddress: '',
    eventCity: '',
    accessTransport: '',
    accessParking: '',
    accessInfo: '',
    ticketInfo: '',
    contactEmail: '',
    contactPhone: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/infos-pratiques')
      .then(res => res.json())
      .then(data => {
        setInfos(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setMessage({ type: 'error', text: 'Erreur lors du chargement des informations' })
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/infos-pratiques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(infos),
      })

      if (!res.ok) throw new Error('Failed to save')

      setMessage({ type: 'success', text: 'Informations enregistrées avec succès !' })
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof InfosPratiques, value: string) => {
    setInfos(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Infos Pratiques</h1>
        <p className="text-gray-600">Modifiez les informations pratiques affichées sur le site</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Info */}
        <Card variant="default" className="bg-white">
          <CardContent>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
              Informations de l&apos;événement
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Date de l'événement"
                value={infos.eventDate}
                onChange={(e) => handleChange('eventDate', e.target.value)}
                placeholder="28 Mars 2026"
              />
              <Input
                label="Horaires"
                value={infos.eventTime}
                onChange={(e) => handleChange('eventTime', e.target.value)}
                placeholder="9h00 - 19h00"
              />
              <Input
                label="Nom du lieu"
                value={infos.eventLocation}
                onChange={(e) => handleChange('eventLocation', e.target.value)}
                placeholder="L'Agronaute"
              />
              <Input
                label="Ville"
                value={infos.eventCity}
                onChange={(e) => handleChange('eventCity', e.target.value)}
                placeholder="Nantes"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Adresse"
                  value={infos.eventAddress}
                  onChange={(e) => handleChange('eventAddress', e.target.value)}
                  placeholder="24 quai de la Fosse"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Info */}
        <Card variant="default" className="bg-white">
          <CardContent>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
              Accès
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transports en commun
                </label>
                <textarea
                  value={infos.accessTransport}
                  onChange={(e) => handleChange('accessTransport', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                  placeholder="Tramway ligne 1, arrêt Médiathèque..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parking
                </label>
                <textarea
                  value={infos.accessParking}
                  onChange={(e) => handleChange('accessParking', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                  placeholder="Parking Médiathèque à 200m..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accessibilité
                </label>
                <textarea
                  value={infos.accessInfo}
                  onChange={(e) => handleChange('accessInfo', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                  placeholder="Le lieu est accessible aux personnes à mobilité réduite..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Info */}
        <Card variant="default" className="bg-white">
          <CardContent>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
              Billetterie
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Informations billetterie
              </label>
              <textarea
                value={infos.ticketInfo}
                onChange={(e) => handleChange('ticketInfo', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                placeholder="Les billets sont disponibles en ligne..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card variant="default" className="bg-white">
          <CardContent>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
              Contact
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Email de contact"
                type="email"
                value={infos.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="hello@cannagri-expo.fr"
              />
              <Input
                label="Téléphone"
                value={infos.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="+33 2 XX XX XX XX"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enregistrement...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

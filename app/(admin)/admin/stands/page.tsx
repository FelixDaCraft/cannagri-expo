'use client'

import { useState, useEffect } from 'react'
import { AdminInteractiveStandPlan, Stand, StandStatus, StandSize } from '@/components/stands'
import { Badge, Button, Card, CardContent, Modal } from '@/components/ui'
import { formatPrice } from '@/lib/utils'

const statusConfig: Record<StandStatus, { label: string; variant: 'success' | 'warning' | 'error' }> = {
  FREE: { label: 'Libre', variant: 'success' },
  RESERVED: { label: 'Réservé', variant: 'warning' },
  SOLD: { label: 'Vendu', variant: 'error' },
}

const sizeConfig: Record<StandSize, { label: string; description: string }> = {
  SMALL: { label: 'Petit', description: '6-9 m²' },
  MEDIUM: { label: 'Moyen', description: '12-18 m²' },
  LARGE: { label: 'Grand', description: '24+ m²' },
}

export default function StandsPage() {
  const [stands, setStands] = useState<Stand[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'plan' | 'list'>('plan')
  const [editingStand, setEditingStand] = useState<Stand | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state for editing
  const [formData, setFormData] = useState({
    number: '',
    surfaceM2: '',
    priceHT: '',
    status: 'FREE' as StandStatus,
    size: 'MEDIUM' as StandSize,
    exhibitorName: '',
    hasFurniture: false,
    hasElectricity: false,
    furniturePrice: '120',
    electricityPrice: '80',
  })

  useEffect(() => {
    fetchStands()
  }, [])

  const fetchStands = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stands')
      const data = await res.json()
      if (data.data) {
        setStands(data.data)
      }
    } catch (error) {
      console.error('Error fetching stands:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des stands' })
    } finally {
      setLoading(false)
    }
  }

  const handleEditStand = (stand: Stand) => {
    setEditingStand(stand)
    setFormData({
      number: (stand.number || stand.code || '').toString(),
      surfaceM2: stand.surfaceM2.toString(),
      priceHT: stand.priceHT.toString(),
      status: stand.status,
      size: stand.size,
      exhibitorName: stand.exhibitorName || '',
      hasFurniture: stand.hasFurniture,
      hasElectricity: stand.hasElectricity,
      furniturePrice: stand.furniturePrice.toString(),
      electricityPrice: stand.electricityPrice.toString(),
    })
  }

  const handleSaveStand = async () => {
    if (!editingStand) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/stands', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStand.id,
          number: parseInt(formData.number) || editingStand.number,
          surfaceM2: parseFloat(formData.surfaceM2),
          priceHT: parseFloat(formData.priceHT),
          status: formData.status,
          size: formData.size,
          exhibitorName: formData.exhibitorName || null,
          hasFurniture: formData.hasFurniture,
          hasElectricity: formData.hasElectricity,
          furniturePrice: parseFloat(formData.furniturePrice),
          electricityPrice: parseFloat(formData.electricityPrice),
        })
      })

      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: 'Stand mis à jour avec succès' })
        setEditingStand(null)
        fetchStands()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la mise à jour' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    } finally {
      setSaving(false)
    }
  }

  const handleInitializeStands = async () => {
    if (!confirm('Voulez-vous initialiser les 25 stands par défaut ? Les stands non vendus seront réinitialisés.')) {
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/stands', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
        })
      })

      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        fetchStands()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'initialisation' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'initialisation' })
    } finally {
      setSaving(false)
    }
  }

  const stats = {
    total: stands.length,
    free: stands.filter((s) => s.status === 'FREE').length,
    reserved: stands.filter((s) => s.status === 'RESERVED').length,
    sold: stands.filter((s) => s.status === 'SOLD').length,
    revenue: stands.filter((s) => s.status === 'SOLD').reduce((sum, s) => sum + s.priceHT, 0),
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-gray-900">
            Gestion des Stands
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {stands.length} stands configurés
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant={viewMode === 'plan' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('plan')}
            className="flex-1 sm:flex-none"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Plan
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex-1 sm:flex-none"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Liste
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleInitializeStands}
            disabled={saving}
            className="flex-1 sm:flex-none"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Initialiser 25 stands
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
          <button
            className="float-right font-bold"
            onClick={() => setMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <Card variant="default" className="bg-white">
          <CardContent className="text-center p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-white">
          <CardContent className="text-center p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">Libres</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.free}</p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-white">
          <CardContent className="text-center p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">Réservés</p>
            <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.reserved}</p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-white">
          <CardContent className="text-center p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">Vendus</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.sold}</p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-white col-span-2 sm:col-span-1">
          <CardContent className="text-center p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">CA Stands</p>
            <p className="text-xl sm:text-2xl font-bold text-forest">{formatPrice(stats.revenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
        </div>
      ) : viewMode === 'plan' ? (
        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm">
          <AdminInteractiveStandPlan
            stands={stands}
            loading={loading}
            onStandClick={handleEditStand}
            onStatusChange={async (standId, newStatus) => {
              try {
                const res = await fetch('/api/admin/stands', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: standId, status: newStatus })
                })
                if (res.ok) {
                  fetchStands()
                  setMessage({ type: 'success', text: 'Statut mis à jour' })
                }
              } catch {
                setMessage({ type: 'error', text: 'Erreur de mise à jour' })
              }
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exposant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surface</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix HT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stands.map((stand) => (
                  <tr key={stand.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-forest">
                      {stand.number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {stand.exhibitorName ? (
                        <span className="text-gray-900">{stand.exhibitorName}</span>
                      ) : (
                        <span className="text-gray-400 italic">Non assigné</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {stand.surfaceM2} m²
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      {formatPrice(stand.priceHT)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={statusConfig[stand.status].variant}>
                        {statusConfig[stand.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        {stand.hasFurniture && <Badge variant="default" size="sm">Mobilier</Badge>}
                        {stand.hasElectricity && <Badge variant="default" size="sm">Élec</Badge>}
                        {!stand.hasFurniture && !stand.hasElectricity && <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStand(stand)}
                      >
                        Modifier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingStand}
        onClose={() => setEditingStand(null)}
        title={`Modifier le stand ${editingStand?.number || editingStand?.code}`}
      >
        {editingStand && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro du stand</label>
                <input
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
                  min="1"
                  max="99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                <input
                  type="number"
                  value={formData.surfaceM2}
                  onChange={(e) => setFormData({ ...formData, surfaceM2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix HT (€)</label>
                <input
                  type="number"
                  value={formData.priceHT}
                  onChange={(e) => setFormData({ ...formData, priceHT: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value as StandSize })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
                >
                  {Object.entries(sizeConfig).map(([key, { label, description }]) => (
                    <option key={key} value={key}>{label} ({description})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exposant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exposant assigné
                <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
              </label>
              <input
                type="text"
                value={formData.exhibitorName}
                onChange={(e) => setFormData({ ...formData, exhibitorName: e.target.value })}
                placeholder="Nom de l'exposant"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <div className="flex flex-wrap gap-2">
                {(['FREE', 'RESERVED', 'SOLD'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={formData.status === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, status })}
                  >
                    {statusConfig[status].label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.hasFurniture}
                    onChange={(e) => setFormData({ ...formData, hasFurniture: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest"
                  />
                  <span>Mobilier (+{formData.furniturePrice}€)</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.hasElectricity}
                    onChange={(e) => setFormData({ ...formData, hasElectricity: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest"
                  />
                  <span>Électricité (+{formData.electricityPrice}€)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t flex gap-3">
              <Button
                variant="outline"
                onClick={() => setEditingStand(null)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveStand}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

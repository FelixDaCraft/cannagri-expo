'use client'

import { useState } from 'react'
import { StandPlan } from '@/components/stands'
import { DataTable } from '@/components/admin'
import { Badge, Button, Card, CardContent, Modal } from '@/components/ui'
import { formatPrice } from '@/lib/utils'

// Types locaux pour éviter les conflits
type StandStatus = 'FREE' | 'RESERVED' | 'SOLD'

interface StandData {
  id: string
  code: string
  surfaceM2: number
  priceHT: number
  status: StandStatus
  row: number
  col: number
  width?: number
  height?: number
  hasFurniture: boolean
  hasElectricity: boolean
  furniturePrice: number
  electricityPrice: number
}

// Mock data avec typage explicite
const initialStands: StandData[] = [
  { id: '1', code: 'A1', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 0, col: 0, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '2', code: 'A2', surfaceM2: 12, priceHT: 450, status: 'SOLD', row: 0, col: 1, hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '3', code: 'A3', surfaceM2: 18, priceHT: 650, status: 'FREE', row: 0, col: 2, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '4', code: 'A4', surfaceM2: 12, priceHT: 450, status: 'RESERVED', row: 0, col: 3, hasFurniture: false, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '5', code: 'B1', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 1, col: 0, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '6', code: 'B2', surfaceM2: 24, priceHT: 850, status: 'SOLD', row: 1, col: 1, hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '7', code: 'B3', surfaceM2: 18, priceHT: 650, status: 'FREE', row: 1, col: 2, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '8', code: 'B4', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 1, col: 3, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
]

const statusConfig: Record<StandStatus, { label: string; variant: 'success' | 'warning' | 'error' }> = {
  FREE: { label: 'Libre', variant: 'success' },
  RESERVED: { label: 'Réservé', variant: 'warning' },
  SOLD: { label: 'Vendu', variant: 'error' },
}

export default function StandsPage() {
  const [stands, setStands] = useState<StandData[]>(initialStands)
  const [viewMode, setViewMode] = useState<'plan' | 'list'>('plan')
  const [editingStand, setEditingStand] = useState<StandData | null>(null)

  const stats = {
    total: stands.length,
    free: stands.filter((s) => s.status === 'FREE').length,
    reserved: stands.filter((s) => s.status === 'RESERVED').length,
    sold: stands.filter((s) => s.status === 'SOLD').length,
    revenue: stands.filter((s) => s.status === 'SOLD').reduce((sum, s) => sum + s.priceHT, 0),
  }

  const handleUpdateStatus = (stand: StandData, newStatus: StandStatus) => {
    setStands(prev => prev.map((s) =>
      s.id === stand.id ? { ...s, status: newStatus } : s
    ))
    setEditingStand(null)
  }

  const columns = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (stand: StandData) => (
        <span className="font-mono font-bold">{stand.code}</span>
      ),
    },
    {
      key: 'surfaceM2',
      label: 'Surface',
      render: (stand: StandData) => `${stand.surfaceM2} m²`,
    },
    {
      key: 'priceHT',
      label: 'Prix HT',
      render: (stand: StandData) => formatPrice(stand.priceHT),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (stand: StandData) => {
        const config = statusConfig[stand.status]
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
    {
      key: 'options',
      label: 'Options',
      render: (stand: StandData) => (
        <div className="flex gap-2">
          {stand.hasFurniture && <Badge variant="default" size="sm">Mobilier</Badge>}
          {stand.hasElectricity && <Badge variant="default" size="sm">Électricité</Badge>}
          {!stand.hasFurniture && !stand.hasElectricity && <span className="text-gray-400">-</span>}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-gray-900">
            Gestion des Stands
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Vue et gestion des emplacements</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
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
        </div>
      </div>

      {/* Stats - Mobile grid */}
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
      {viewMode === 'plan' ? (
        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm">
          <StandPlan readOnly />
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
            Passez en mode Liste pour modifier le statut des stands
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <DataTable
            data={stands}
            columns={columns}
            onEdit={(stand) => setEditingStand(stand as StandData)}
            searchPlaceholder="Rechercher un stand..."
          />
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingStand}
        onClose={() => setEditingStand(null)}
        title={`Stand ${editingStand?.code}`}
      >
        {editingStand && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Surface</span>
                <p className="font-semibold">{editingStand.surfaceM2} m²</p>
              </div>
              <div>
                <span className="text-gray-500">Prix HT</span>
                <p className="font-semibold">{formatPrice(editingStand.priceHT)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modifier le statut
              </label>
              <div className="flex flex-wrap gap-2">
                {(['FREE', 'RESERVED', 'SOLD'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={editingStand.status === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateStatus(editingStand, status)}
                  >
                    {statusConfig[status].label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" onClick={() => setEditingStand(null)} className="w-full">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

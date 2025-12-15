'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui'

// Types
interface StandPosition {
  gridColumn: number
  gridRow: number
}

interface Stand {
  id: number
  name: string
  position: StandPosition
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

interface Zone {
  id: string
  type: string
  name: string
  position: {
    gridColumn: string
    gridRow: string
  }
  style: string
  clickable: boolean
  icon?: {
    type: string
    direction: string
  }
}

interface PlanConfig {
  stands: Stand[]
  zones: Zone[]
  grid: {
    columns: number
    rows: number
  }
  categories: Record<string, { name: string; description: string }>
  statuses: Record<string, { label: string; color: string; canReserve: boolean }>
  amenities: Record<string, { name: string; icon: string; included: boolean; price?: number }>
}

// Default config from plan-config.json
const defaultConfig: PlanConfig = {
  grid: { columns: 10, rows: 13 },
  zones: [
    { id: 'CONF', type: 'conference', name: 'Conférences', position: { gridColumn: '1', gridRow: '1 / 5' }, style: 'dashed', clickable: false },
    { id: 'BAR', type: 'bar', name: 'Bar', position: { gridColumn: '1', gridRow: '6 / 9' }, style: 'dashed', clickable: false },
    { id: 'TABLES', type: 'tables', name: 'Tables', position: { gridColumn: '3 / 7', gridRow: '6 / 9' }, style: 'dashed', clickable: false },
    { id: 'ENTRY', type: 'entry', name: 'Entrée', position: { gridColumn: '1', gridRow: '11 / 13' }, style: 'dashed', clickable: false, icon: { type: 'arrow', direction: 'right' } },
  ],
  stands: [
    { id: 1, name: 'Stand 1', position: { gridColumn: 2, gridRow: 4 }, location: 'Côté Conférences', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 2, name: 'Stand 2', position: { gridColumn: 2, gridRow: 3 }, location: 'Côté Conférences', surface: 4, price: 150, currency: 'EUR', status: 'reserved', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: 'CBD France', reservedAt: null },
    { id: 3, name: 'Stand 3', position: { gridColumn: 2, gridRow: 2 }, location: 'Angle Nord-Ouest', surface: 4, price: 150, currency: 'EUR', status: 'sold', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: 'HempCo', reservedAt: null },
    { id: 4, name: 'Stand 4', position: { gridColumn: 3, gridRow: 1 }, location: 'Allée Nord', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 5, name: 'Stand 5', position: { gridColumn: 4, gridRow: 1 }, location: 'Allée Nord', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 6, name: 'Stand 6', position: { gridColumn: 5, gridRow: 1 }, location: 'Allée Nord', surface: 4, price: 150, currency: 'EUR', status: 'reserved', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: 'GreenLeaf', reservedAt: null },
    { id: 7, name: 'Stand 7', position: { gridColumn: 6, gridRow: 1 }, location: 'Allée Nord', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 8, name: 'Stand 8', position: { gridColumn: 7, gridRow: 1 }, location: 'Allée Nord', surface: 4, price: 150, currency: 'EUR', status: 'sold', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: 'BioHemp', reservedAt: null },
    { id: 9, name: 'Stand 9', position: { gridColumn: 8, gridRow: 1 }, location: 'Angle Nord-Est', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 10, name: 'Stand 10', position: { gridColumn: 10, gridRow: 2 }, location: 'Allée Est', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 11, name: 'Stand 11', position: { gridColumn: 10, gridRow: 3 }, location: 'Allée Est', surface: 4, price: 150, currency: 'EUR', status: 'reserved', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: 'NaturaCBD', reservedAt: null },
    { id: 12, name: 'Stand 12', position: { gridColumn: 10, gridRow: 4 }, location: 'Allée Est', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 13, name: 'Stand 13', position: { gridColumn: 10, gridRow: 5 }, location: 'Allée Est', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 14, name: 'Stand 14', position: { gridColumn: 10, gridRow: 6 }, location: 'Allée Est', surface: 4, price: 150, currency: 'EUR', status: 'sold', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: 'HempTech', reservedAt: null },
    { id: 15, name: 'Stand 15', position: { gridColumn: 10, gridRow: 7 }, location: 'Allée Est', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 16, name: 'Stand 16', position: { gridColumn: 10, gridRow: 8 }, location: 'Allée Est', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 17, name: 'Stand 17', position: { gridColumn: 10, gridRow: 9 }, location: 'Allée Est', surface: 4, price: 150, currency: 'EUR', status: 'reserved', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: 'CannaBio', reservedAt: null },
    { id: 18, name: 'Stand 18', position: { gridColumn: 10, gridRow: 10 }, location: 'Allée Est', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 19, name: 'Stand 19', position: { gridColumn: 10, gridRow: 11 }, location: 'Angle Sud-Est', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 20, name: 'Stand 20', position: { gridColumn: 8, gridRow: 13 }, location: 'Allée Sud', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 21, name: 'Stand 21', position: { gridColumn: 7, gridRow: 13 }, location: 'Allée Sud', surface: 4, price: 150, currency: 'EUR', status: 'sold', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: 'FrenchHemp', reservedAt: null },
    { id: 22, name: 'Stand 22', position: { gridColumn: 6, gridRow: 13 }, location: 'Allée Sud', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 23, name: 'Stand 23', position: { gridColumn: 5, gridRow: 13 }, location: 'Allée Sud', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
    { id: 24, name: 'Stand 24', position: { gridColumn: 4, gridRow: 13 }, location: 'Allée Sud', surface: 4, price: 150, currency: 'EUR', status: 'reserved', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: 'EcoCBD', reservedAt: null },
    { id: 25, name: 'Stand 25', position: { gridColumn: 3, gridRow: 13 }, location: 'Allée Sud (près entrée)', surface: 4, price: 150, currency: 'EUR', status: 'available', category: 'standard', amenities: ['electricity', 'furniture'], reservedBy: null, reservedAt: null },
  ],
  categories: {
    standard: { name: 'Stand 4m²', description: 'Mobilier et électricité inclus' },
    premium: { name: 'Stand 4m²', description: 'Mobilier et électricité inclus' },
    corner: { name: 'Stand 4m²', description: 'Mobilier et électricité inclus' },
  },
  statuses: {
    available: { label: 'Disponible', color: '#4CAF50', canReserve: true },
    reserved: { label: 'Réservé', color: '#FFA726', canReserve: false },
    sold: { label: 'Vendu', color: '#EF5350', canReserve: false },
    blocked: { label: 'Indisponible', color: '#9E9E9E', canReserve: false },
  },
  amenities: {
    electricity: { name: 'Électricité', icon: '⚡', included: true },
    wifi: { name: 'WiFi', icon: '📶', included: true },
    water: { name: 'Point d\'eau', icon: '💧', included: false, price: 50 },
    furniture: { name: 'Mobilier', icon: '🪑', included: true },
  },
}

interface InteractiveStandPlanProps {
  config?: Partial<PlanConfig>
  onStandSelect?: (stand: Stand) => void
  onReserve?: (stand: Stand) => void
  readOnly?: boolean
}

export function InteractiveStandPlan({
  config: customConfig,
  onStandSelect,
  onReserve,
  readOnly = false,
}: InteractiveStandPlanProps) {
  const config = { ...defaultConfig, ...customConfig }
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter stands
  const filteredStands = useMemo(() => {
    return config.stands.filter((stand) => {
      if (statusFilter !== 'all' && stand.status !== statusFilter) return false
      return true
    })
  }, [config.stands, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const available = config.stands.filter((s) => s.status === 'available').length
    const reserved = config.stands.filter((s) => s.status === 'reserved').length
    const sold = config.stands.filter((s) => s.status === 'sold').length
    return { available, reserved, sold, total: config.stands.length }
  }, [config.stands])

  const handleStandClick = (stand: Stand) => {
    setSelectedStand(stand)
    onStandSelect?.(stand)
  }

  const handleReserve = () => {
    if (selectedStand && selectedStand.status === 'available') {
      onReserve?.(selectedStand)
    }
  }

  const getStatusColor = (status: string) => {
    return config.statuses[status]?.color || '#9E9E9E'
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600 cursor-pointer'
      case 'reserved':
        return 'bg-orange-400 cursor-not-allowed'
      case 'sold':
        return 'bg-red-400 cursor-not-allowed'
      default:
        return 'bg-gray-400 cursor-not-allowed'
    }
  }

  return (
    <div className="w-full">
      {/* Header with filters */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold text-forest">Plan des Stands</h2>
          <p className="text-forest/60 text-sm">
            {stats.available} disponibles sur {stats.total} stands
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-forest/20 rounded-lg bg-white text-sm focus:ring-2 focus:ring-sage focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponibles</option>
            <option value="reserved">Réservés</option>
            <option value="sold">Vendus</option>
          </select>

        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-forest/70">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-400" />
          <span className="text-forest/70">Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-400" />
          <span className="text-forest/70">Vendu</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-dashed border-forest/30" />
          <span className="text-forest/70">Zone commune</span>
        </div>
      </div>

      <div className={`flex flex-col xl:flex-row gap-6 ${!selectedStand ? 'justify-center' : ''}`}>
        {/* Plan Grid */}
        <div className={`bg-cream/50 rounded-2xl p-6 overflow-x-auto ${!selectedStand ? 'xl:max-w-4xl mx-auto' : 'flex-1'}`}>
          <div
            className="grid gap-2 min-w-[600px]"
            style={{
              gridTemplateColumns: `repeat(${config.grid.columns}, minmax(50px, 1fr))`,
              gridTemplateRows: `repeat(${config.grid.rows}, 50px)`,
            }}
          >
            {/* Zones */}
            {config.zones.map((zone) => (
              <div
                key={zone.id}
                className="border-2 border-dashed border-forest/30 rounded-lg flex items-center justify-center bg-white/50"
                style={{
                  gridColumn: zone.position.gridColumn,
                  gridRow: zone.position.gridRow,
                }}
              >
                <div className="text-center px-2">
                  {zone.icon?.type === 'arrow' && (
                    <span className="text-2xl block mb-1">→</span>
                  )}
                  <span className="text-xs font-medium text-forest/60">{zone.name}</span>
                </div>
              </div>
            ))}

            {/* Stands */}
            {filteredStands.map((stand) => (
              <motion.button
                key={stand.id}
                whileHover={{ scale: stand.status === 'available' ? 1.05 : 1 }}
                whileTap={{ scale: stand.status === 'available' ? 0.95 : 1 }}
                onClick={() => handleStandClick(stand)}
                className={`
                  rounded-lg flex items-center justify-center font-bold text-white text-sm
                  transition-all shadow-md
                  ${getStatusClass(stand.status)}
                  ${selectedStand?.id === stand.id ? 'ring-4 ring-forest ring-offset-2' : ''}
                `}
                style={{
                  gridColumn: stand.position.gridColumn,
                  gridRow: stand.position.gridRow,
                }}
                title={`${stand.name} - ${config.statuses[stand.status]?.label}`}
              >
                {stand.id}
              </motion.button>
            ))}

            {/* Hidden stands (filtered out) */}
            {config.stands
              .filter((s) => !filteredStands.includes(s))
              .map((stand) => (
                <div
                  key={stand.id}
                  className="rounded-lg flex items-center justify-center bg-gray-200 text-gray-400 text-sm opacity-30"
                  style={{
                    gridColumn: stand.position.gridColumn,
                    gridRow: stand.position.gridRow,
                  }}
                >
                  {stand.id}
                </div>
              ))}
          </div>
        </div>

        {/* Stand Details Panel */}
        <AnimatePresence mode="wait">
          {selectedStand ? (
            <motion.div
              key={selectedStand.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full xl:w-80 bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-heading font-bold text-forest">
                    {selectedStand.name}
                  </h3>
                  <p className="text-forest/60 text-sm">{selectedStand.location}</p>
                </div>
                <button
                  onClick={() => setSelectedStand(null)}
                  className="p-1 hover:bg-cream rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-forest/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Badge */}
              <div
                className="inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium mb-4"
                style={{ backgroundColor: getStatusColor(selectedStand.status) }}
              >
                {config.statuses[selectedStand.status]?.label}
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-forest/60">Surface</span>
                  <span className="font-medium text-forest">{selectedStand.surface} m²</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-forest/60">Catégorie</span>
                  <span className="font-medium text-forest">
                    {config.categories[selectedStand.category]?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-forest/60">Prix</span>
                  <span className="font-bold text-terracotta text-lg">
                    {selectedStand.price} €
                  </span>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <p className="text-sm text-forest/60 mb-2">Équipements inclus</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStand.amenities.map((amenityKey) => {
                    const amenity = config.amenities[amenityKey]
                    return amenity ? (
                      <span
                        key={amenityKey}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-sage/20 text-forest text-xs rounded-full"
                      >
                        <span>{amenity.icon}</span>
                        {amenity.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>

              {/* Reserved By */}
              {selectedStand.reservedBy && (
                <div className="mb-6 p-3 bg-cream rounded-lg">
                  <p className="text-xs text-forest/60 mb-1">Réservé par</p>
                  <p className="font-medium text-forest">{selectedStand.reservedBy}</p>
                </div>
              )}

              {/* Action Button */}
              {!readOnly && selectedStand.status === 'available' && (
                <Button
                  onClick={handleReserve}
                  className="w-full bg-terracotta hover:bg-terracotta-600"
                >
                  Réserver ce stand
                </Button>
              )}

              {selectedStand.status !== 'available' && (
                <p className="text-center text-sm text-forest/50">
                  Ce stand n&apos;est plus disponible
                </p>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-forest">{stats.total}</p>
          <p className="text-sm text-forest/60">Total stands</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          <p className="text-sm text-green-600/70">Disponibles</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{stats.reserved}</p>
          <p className="text-sm text-orange-500/70">Réservés</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{stats.sold}</p>
          <p className="text-sm text-red-500/70">Vendus</p>
        </div>
      </div>
    </div>
  )
}

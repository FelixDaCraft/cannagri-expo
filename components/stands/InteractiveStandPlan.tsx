'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
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

// Database stand type
interface DBStand {
  id: string
  code: string
  row: number
  col: number
  surfaceM2: number
  priceHT: number
  status: 'FREE' | 'RESERVED' | 'SOLD' | 'BLOCKED'
  hasFurniture: boolean
  hasElectricity: boolean
  order?: {
    customerName: string
    companyName: string | null
  } | null
}

// Map DB status to UI status
function mapStatus(dbStatus: string): 'available' | 'reserved' | 'sold' | 'blocked' {
  switch (dbStatus) {
    case 'FREE': return 'available'
    case 'RESERVED': return 'reserved'
    case 'SOLD': return 'sold'
    case 'BLOCKED': return 'blocked'
    default: return 'blocked'
  }
}

// Convert DB stand to UI stand format
function convertDBStandToUIStand(dbStand: DBStand): Stand {
  const amenities: string[] = []
  if (dbStand.hasElectricity) amenities.push('electricity')
  if (dbStand.hasFurniture) amenities.push('furniture')

  return {
    id: parseInt(dbStand.code) || 0,
    name: `Stand ${dbStand.code}`,
    position: {
      gridColumn: dbStand.col,
      gridRow: dbStand.row,
    },
    location: getLocationFromPosition(dbStand.row, dbStand.col),
    surface: dbStand.surfaceM2,
    price: dbStand.priceHT,
    currency: 'EUR',
    status: mapStatus(dbStand.status),
    category: 'standard',
    amenities,
    reservedBy: dbStand.order?.companyName || dbStand.order?.customerName || null,
    reservedAt: null,
  }
}

// Get location description from position
function getLocationFromPosition(row: number, col: number): string {
  if (row === 1) return 'Allée Nord'
  if (row === 13) return 'Allée Sud'
  if (col === 10) return 'Allée Est'
  if (col === 2) return 'Côté Conférences'
  return 'Zone centrale'
}

// Default static config (zones and settings)
const defaultConfig: Omit<PlanConfig, 'stands'> & { stands: Stand[] } = {
  grid: { columns: 10, rows: 13 },
  zones: [
    { id: 'CONF', type: 'conference', name: 'Conférences', position: { gridColumn: '1', gridRow: '1 / 5' }, style: 'dashed', clickable: false },
    { id: 'BAR', type: 'bar', name: 'Bar', position: { gridColumn: '1', gridRow: '6 / 9' }, style: 'dashed', clickable: false },
    { id: 'TABLES', type: 'tables', name: 'Tables', position: { gridColumn: '3 / 7', gridRow: '6 / 9' }, style: 'dashed', clickable: false },
    { id: 'ENTRY', type: 'entry', name: 'Entrée', position: { gridColumn: '1', gridRow: '11 / 13' }, style: 'dashed', clickable: false, icon: { type: 'arrow', direction: 'right' } },
  ],
  stands: [], // Will be loaded from API
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
  const [stands, setStands] = useState<Stand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const config = { ...defaultConfig, ...customConfig, stands }

  // Fetch stands from API
  const fetchStands = useCallback(async () => {
    try {
      const response = await fetch('/api/stands')
      if (response.ok) {
        const data = await response.json()
        const dbStands: DBStand[] = data.data || []
        const uiStands = dbStands.map(convertDBStandToUIStand)
        setStands(uiStands)
      }
    } catch (error) {
      console.error('Failed to fetch stands:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchStands()
  }, [fetchStands])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchStands, 30000)
    return () => clearInterval(interval)
  }, [fetchStands])

  // Filter stands
  const filteredStands = useMemo(() => {
    return stands.filter((stand) => {
      if (statusFilter !== 'all' && stand.status !== statusFilter) return false
      return true
    })
  }, [stands, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const available = stands.filter((s) => s.status === 'available').length
    const reserved = stands.filter((s) => s.status === 'reserved').length
    const sold = stands.filter((s) => s.status === 'sold').length
    return { available, reserved, sold, total: stands.length }
  }, [stands])

  const handleStandClick = (stand: Stand) => {
    console.log('[InteractiveStandPlan] Stand clicked:', stand.name, 'status:', stand.status)
    setSelectedStand(stand)
    onStandSelect?.(stand)
  }

  const handleReserve = () => {
    console.log('[InteractiveStandPlan] handleReserve called')
    console.log('[InteractiveStandPlan] selectedStand:', selectedStand)
    console.log('[InteractiveStandPlan] onReserve defined:', !!onReserve)
    if (selectedStand && selectedStand.status === 'available') {
      console.log('[InteractiveStandPlan] Calling onReserve with stand:', selectedStand.name)
      onReserve?.(selectedStand)
    } else {
      console.log('[InteractiveStandPlan] Cannot reserve - status:', selectedStand?.status)
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

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    )
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

          {/* Refresh button */}
          <button
            onClick={fetchStands}
            className="px-3 py-2 border border-forest/20 rounded-lg bg-white text-sm hover:bg-cream transition-colors"
            title="Actualiser"
          >
            <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
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
            {filteredStands.map((stand) => {
              // Stands à rotation 90°: 10-19 (colonne droite) et 31-34 (autour des tables)
              const shouldRotate = (stand.id >= 10 && stand.id <= 19) || (stand.id >= 31 && stand.id <= 34)
              return (
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
                    transform: shouldRotate ? 'rotate(90deg)' : undefined,
                  }}
                  title={`${stand.name} - ${config.statuses[stand.status]?.label}`}
                >
                  {stand.id}
                </motion.button>
              )
            })}

            {/* Hidden stands (filtered out) */}
            {stands
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

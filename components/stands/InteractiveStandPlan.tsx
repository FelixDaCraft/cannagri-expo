'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui'

// Types
interface Stand {
  id: number
  name: string
  x: number
  y: number
  width: number
  height: number
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
  name: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  bgColor: string
  borderColor: string
}

// Plan dimensions
const PLAN_WIDTH = 700
const PLAN_HEIGHT = 550

// Zones de la salle
const zones: Zone[] = [
  {
    id: 'CONF',
    name: 'Conferences',
    icon: '🎤',
    x: 10, y: 10, width: 100, height: 140,
    bgColor: 'bg-blue-50/80',
    borderColor: 'border-blue-200'
  },
  {
    id: 'BAR',
    name: 'Bar',
    icon: '🍷',
    x: 10, y: 200, width: 100, height: 120,
    bgColor: 'bg-amber-50/80',
    borderColor: 'border-amber-200'
  },
  {
    id: 'TABLES',
    name: 'Tables',
    icon: '🪑',
    x: 200, y: 220, width: 300, height: 120,
    bgColor: 'bg-emerald-50/80',
    borderColor: 'border-emerald-200'
  },
  {
    id: 'ENTRY',
    name: 'Entree',
    icon: '🚪',
    x: 10, y: 450, width: 100, height: 80,
    bgColor: 'bg-purple-50/80',
    borderColor: 'border-purple-200'
  },
]

// Taille uniforme pour tous les stands (carres)
const STAND_SIZE = 45

// Default stand positions - tous les stands ont la meme taille
const defaultStandConfig: Record<number, { x: number; y: number; width: number; height: number }> = {
  // === RANGEE DU HAUT (1-6) ===
  1: { x: 180, y: 15, width: STAND_SIZE, height: STAND_SIZE },
  2: { x: 235, y: 15, width: STAND_SIZE, height: STAND_SIZE },
  3: { x: 290, y: 15, width: STAND_SIZE, height: STAND_SIZE },
  4: { x: 345, y: 15, width: STAND_SIZE, height: STAND_SIZE },
  5: { x: 400, y: 15, width: STAND_SIZE, height: STAND_SIZE },
  6: { x: 455, y: 15, width: STAND_SIZE, height: STAND_SIZE },

  // === PRES CONFERENCES (7-8) ===
  7: { x: 125, y: 15, width: STAND_SIZE, height: STAND_SIZE },
  8: { x: 125, y: 70, width: STAND_SIZE, height: STAND_SIZE },

  // === COLONNE DE DROITE (9-16) ===
  9: { x: 510, y: 15, width: STAND_SIZE, height: STAND_SIZE },
  10: { x: 510, y: 70, width: STAND_SIZE, height: STAND_SIZE },
  11: { x: 510, y: 125, width: STAND_SIZE, height: STAND_SIZE },
  12: { x: 510, y: 180, width: STAND_SIZE, height: STAND_SIZE },
  13: { x: 510, y: 235, width: STAND_SIZE, height: STAND_SIZE },
  14: { x: 510, y: 290, width: STAND_SIZE, height: STAND_SIZE },
  15: { x: 510, y: 345, width: STAND_SIZE, height: STAND_SIZE },
  16: { x: 510, y: 400, width: STAND_SIZE, height: STAND_SIZE },

  // === RANGEE DU BAS (17-22) ===
  17: { x: 455, y: 490, width: STAND_SIZE, height: STAND_SIZE },
  18: { x: 400, y: 490, width: STAND_SIZE, height: STAND_SIZE },
  19: { x: 345, y: 490, width: STAND_SIZE, height: STAND_SIZE },
  20: { x: 290, y: 490, width: STAND_SIZE, height: STAND_SIZE },
  21: { x: 235, y: 490, width: STAND_SIZE, height: STAND_SIZE },
  22: { x: 180, y: 490, width: STAND_SIZE, height: STAND_SIZE },

  // === AU-DESSUS DES TABLES (23-27) ===
  23: { x: 180, y: 165, width: STAND_SIZE, height: STAND_SIZE },
  24: { x: 235, y: 165, width: STAND_SIZE, height: STAND_SIZE },
  25: { x: 290, y: 165, width: STAND_SIZE, height: STAND_SIZE },
  26: { x: 345, y: 165, width: STAND_SIZE, height: STAND_SIZE },
  27: { x: 400, y: 165, width: STAND_SIZE, height: STAND_SIZE },

  // === GAUCHE DES TABLES (28-29) ===
  28: { x: 125, y: 230, width: STAND_SIZE, height: STAND_SIZE },
  29: { x: 125, y: 285, width: STAND_SIZE, height: STAND_SIZE },

  // === DROITE DES TABLES (30-31) ===
  30: { x: 455, y: 230, width: STAND_SIZE, height: STAND_SIZE },
  31: { x: 455, y: 285, width: STAND_SIZE, height: STAND_SIZE },

  // === EN-DESSOUS DES TABLES (32-36) ===
  32: { x: 180, y: 380, width: STAND_SIZE, height: STAND_SIZE },
  33: { x: 235, y: 380, width: STAND_SIZE, height: STAND_SIZE },
  34: { x: 290, y: 380, width: STAND_SIZE, height: STAND_SIZE },
  35: { x: 345, y: 380, width: STAND_SIZE, height: STAND_SIZE },
  36: { x: 400, y: 380, width: STAND_SIZE, height: STAND_SIZE },
}

// Database stand type
interface DBStand {
  id: string
  code: string
  x?: number
  y?: number
  width?: number
  height?: number
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
  const standNumber = parseInt(dbStand.code) || 0

  // Use DB position if available, otherwise use default
  const defaultPos = defaultStandConfig[standNumber] || { x: 0, y: 0, width: STAND_SIZE, height: STAND_SIZE }
  const x = dbStand.x ?? defaultPos.x
  const y = dbStand.y ?? defaultPos.y
  const width = dbStand.width ?? defaultPos.width
  const height = dbStand.height ?? defaultPos.height

  return {
    id: standNumber,
    name: `Stand ${dbStand.code}`,
    x,
    y,
    width,
    height,
    location: getLocationFromPosition(y),
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
function getLocationFromPosition(y: number): string {
  if (y < 100) return 'Allee Nord'
  if (y > 450) return 'Allee Sud'
  if (y >= 200 && y <= 350) return 'Zone Tables'
  return 'Zone centrale'
}

const statusConfig = {
  available: {
    label: 'Disponible',
    bgClass: 'bg-gradient-to-br from-green-400 to-green-600',
    hoverClass: 'hover:from-green-500 hover:to-green-700',
    shadowClass: 'shadow-green-500/30',
    glowClass: 'hover:shadow-green-400/50',
    color: '#4CAF50'
  },
  reserved: {
    label: 'Reserve',
    bgClass: 'bg-gradient-to-br from-orange-400 to-orange-600',
    hoverClass: 'hover:from-orange-500 hover:to-orange-700',
    shadowClass: 'shadow-orange-500/30',
    glowClass: 'hover:shadow-orange-400/50',
    color: '#FFA726'
  },
  sold: {
    label: 'Vendu',
    bgClass: 'bg-gradient-to-br from-red-400 to-red-600',
    hoverClass: 'hover:from-red-500 hover:to-red-700',
    shadowClass: 'shadow-red-500/30',
    glowClass: 'hover:shadow-red-400/50',
    color: '#EF5350'
  },
  blocked: {
    label: 'Indisponible',
    bgClass: 'bg-gradient-to-br from-gray-400 to-gray-600',
    hoverClass: '',
    shadowClass: 'shadow-gray-500/30',
    glowClass: '',
    color: '#9E9E9E'
  },
}

interface PlanConfig {
  categories: Record<string, { name: string; description: string }>
  statuses: Record<string, { label: string; color: string; canReserve: boolean }>
  amenities: Record<string, { name: string; icon: string; included: boolean; price?: number }>
}

const defaultConfig: PlanConfig = {
  categories: {
    standard: { name: 'Stand 4m2', description: 'Mobilier et electricite inclus' },
    premium: { name: 'Stand 4m2', description: 'Mobilier et electricite inclus' },
    corner: { name: 'Stand 4m2', description: 'Mobilier et electricite inclus' },
  },
  statuses: {
    available: { label: 'Disponible', color: '#4CAF50', canReserve: true },
    reserved: { label: 'Reserve', color: '#FFA726', canReserve: false },
    sold: { label: 'Vendu', color: '#EF5350', canReserve: false },
    blocked: { label: 'Indisponible', color: '#9E9E9E', canReserve: false },
  },
  amenities: {
    electricity: { name: 'Electricite', icon: '⚡', included: true },
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

  const config = { ...defaultConfig, ...customConfig }

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
            className="px-3 py-2 border border-forest/20 rounded-xl bg-white text-sm focus:ring-2 focus:ring-sage focus:border-transparent shadow-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponibles</option>
            <option value="reserved">Reserves</option>
            <option value="sold">Vendus</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={fetchStands}
            className="px-3 py-2 border border-forest/20 rounded-xl bg-white text-sm hover:bg-cream transition-colors shadow-sm"
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
          <div className="w-4 h-4 rounded-md bg-gradient-to-br from-green-400 to-green-600 shadow-sm" />
          <span className="text-forest/70">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm" />
          <span className="text-forest/70">Reserve</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-gradient-to-br from-red-400 to-red-600 shadow-sm" />
          <span className="text-forest/70">Vendu</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-dashed border-forest/30" />
          <span className="text-forest/70">Zone commune</span>
        </div>
      </div>

      <div className={`flex flex-col xl:flex-row gap-6 ${!selectedStand ? 'justify-center' : ''}`}>
        {/* Plan Canvas */}
        <div className={`bg-gradient-to-br from-slate-50 via-cream/30 to-slate-100 rounded-2xl p-6 overflow-x-auto shadow-inner ${!selectedStand ? 'xl:max-w-4xl mx-auto' : 'flex-1'}`}>
          <div
            className="relative mx-auto"
            style={{ width: PLAN_WIDTH, height: PLAN_HEIGHT }}
          >
            {/* Background grid pattern */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />

            {/* Zones */}
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={`absolute rounded-xl border-2 border-dashed ${zone.bgColor} ${zone.borderColor} flex flex-col items-center justify-center backdrop-blur-sm transition-all hover:scale-[1.02]`}
                style={{
                  left: zone.x,
                  top: zone.y,
                  width: zone.width,
                  height: zone.height,
                }}
              >
                <span className="text-2xl mb-1">{zone.icon}</span>
                <span className="text-xs font-medium text-gray-600">{zone.name}</span>
              </div>
            ))}

            {/* Stands */}
            <AnimatePresence>
              {filteredStands.map((stand, index) => {
                const standConfig = statusConfig[stand.status]

                return (
                  <motion.button
                    key={stand.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      delay: index * 0.02,
                      type: 'spring',
                      stiffness: 300,
                      damping: 25
                    }}
                    whileHover={stand.status === 'available' ? { scale: 1.1, zIndex: 20 } : { zIndex: 10 }}
                    whileTap={stand.status === 'available' ? { scale: 0.95 } : {}}
                    onClick={() => handleStandClick(stand)}
                    className={`
                      absolute rounded-xl flex flex-col items-center justify-center text-white font-bold
                      shadow-lg transition-all duration-200
                      ${standConfig.bgClass} ${standConfig.hoverClass}
                      ${selectedStand?.id === stand.id ? 'ring-4 ring-forest ring-offset-2' : ''}
                      ${stand.status === 'available' ? 'cursor-pointer' : 'cursor-not-allowed'}
                      ${standConfig.shadowClass}
                      hover:shadow-xl ${standConfig.glowClass}
                    `}
                    style={{
                      left: stand.x,
                      top: stand.y,
                      width: stand.width,
                      height: stand.height,
                    }}
                    title={`${stand.name} - ${standConfig.label}`}
                  >
                    <span className="font-bold text-sm drop-shadow-sm">{stand.id}</span>
                  </motion.button>
                )
              })}
            </AnimatePresence>

            {/* Hidden stands (filtered out) */}
            {stands
              .filter((s) => !filteredStands.includes(s))
              .map((stand) => (
                <div
                  key={stand.id}
                  className="absolute rounded-xl flex items-center justify-center bg-gray-200/50 text-gray-400 text-xs border border-gray-300/50"
                  style={{
                    left: stand.x,
                    top: stand.y,
                    width: stand.width,
                    height: stand.height,
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
              className="w-full xl:w-80 bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
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
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-white text-sm font-semibold mb-4 ${statusConfig[selectedStand.status].bgClass}`}
              >
                {statusConfig[selectedStand.status].label}
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-forest/60">Surface</span>
                  <span className="font-medium text-forest">{selectedStand.surface} m2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-forest/60">Categorie</span>
                  <span className="font-medium text-forest">
                    {config.categories[selectedStand.category]?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-forest/60">Prix</span>
                  <span className="font-bold text-terracotta text-lg">
                    {selectedStand.price} EUR
                  </span>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <p className="text-sm text-forest/60 mb-2">Equipements inclus</p>
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
                <div className="mb-6 p-3 bg-cream rounded-xl">
                  <p className="text-xs text-forest/60 mb-1">Reserve par</p>
                  <p className="font-medium text-forest">{selectedStand.reservedBy}</p>
                </div>
              )}

              {/* Action Button */}
              {!readOnly && selectedStand.status === 'available' && (
                <Button
                  onClick={handleReserve}
                  className="w-full bg-terracotta hover:bg-terracotta-600"
                >
                  Reserver ce stand
                </Button>
              )}

              {selectedStand.status !== 'available' && (
                <p className="text-center text-sm text-forest/50 p-3 bg-gray-50 rounded-xl">
                  Ce stand n&apos;est plus disponible
                </p>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-forest">{stats.total}</p>
          <p className="text-sm text-forest/60">Total stands</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          <p className="text-sm text-green-600/70">Disponibles</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-orange-500">{stats.reserved}</p>
          <p className="text-sm text-orange-500/70">Reserves</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-red-500">{stats.sold}</p>
          <p className="text-sm text-red-500/70">Vendus</p>
        </div>
      </div>
    </div>
  )
}

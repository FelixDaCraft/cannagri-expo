'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui'

// Types matching the API/Prisma Stand model
export type AdminStandStatus = 'FREE' | 'RESERVED' | 'SOLD'
export type AdminStandSize = 'SMALL' | 'MEDIUM' | 'LARGE'

export interface AdminStand {
  id: string
  code: string
  number: number
  surfaceM2: number
  priceHT: number
  status: AdminStandStatus
  size: AdminStandSize
  x?: number
  y?: number
  width?: number
  height?: number
  row: number
  col: number
  hasFurniture: boolean
  hasElectricity: boolean
  furniturePrice: number
  electricityPrice: number
  exhibitorName?: string | null
}

interface StandPosition {
  gridColumn: number
  gridRow: number
}

interface StandWithPosition extends AdminStand {
  position: StandPosition
}

interface Zone {
  id: string
  type: string
  name: string
  position: {
    gridColumn: string
    gridRow: string
  }
}

interface AdminStandPlanProps {
  stands: AdminStand[]
  onStandClick?: (stand: AdminStand) => void
  onStatusChange?: (standId: string, newStatus: 'FREE' | 'RESERVED' | 'SOLD') => void
  loading?: boolean
}

// Zones de la salle
const zones: Zone[] = [
  { id: 'CONF', type: 'conference', name: 'Conférences', position: { gridColumn: '1', gridRow: '1 / 5' } },
  { id: 'BAR', type: 'bar', name: 'Bar', position: { gridColumn: '1', gridRow: '6 / 9' } },
  { id: 'TABLES', type: 'tables', name: 'Tables', position: { gridColumn: '3 / 7', gridRow: '6 / 9' } },
  { id: 'ENTRY', type: 'entry', name: 'Entrée', position: { gridColumn: '1', gridRow: '11 / 13' } },
]

// Default positions for stands if not from API
const defaultStandPositions: Record<number, StandPosition> = {
  // Stands à côté conférence (1-3)
  1: { gridColumn: 2, gridRow: 4 },
  2: { gridColumn: 2, gridRow: 3 },
  3: { gridColumn: 2, gridRow: 2 },
  // Rangée du haut (4-9)
  4: { gridColumn: 3, gridRow: 1 },
  5: { gridColumn: 4, gridRow: 1 },
  6: { gridColumn: 5, gridRow: 1 },
  7: { gridColumn: 6, gridRow: 1 },
  8: { gridColumn: 7, gridRow: 1 },
  9: { gridColumn: 8, gridRow: 1 },
  // Colonne de droite (10-19)
  10: { gridColumn: 10, gridRow: 2 },
  11: { gridColumn: 10, gridRow: 3 },
  12: { gridColumn: 10, gridRow: 4 },
  13: { gridColumn: 10, gridRow: 5 },
  14: { gridColumn: 10, gridRow: 6 },
  15: { gridColumn: 10, gridRow: 7 },
  16: { gridColumn: 10, gridRow: 8 },
  17: { gridColumn: 10, gridRow: 9 },
  18: { gridColumn: 10, gridRow: 10 },
  19: { gridColumn: 10, gridRow: 11 },
  // Rangée du bas (20-25)
  20: { gridColumn: 8, gridRow: 13 },
  21: { gridColumn: 7, gridRow: 13 },
  22: { gridColumn: 6, gridRow: 13 },
  23: { gridColumn: 5, gridRow: 13 },
  24: { gridColumn: 4, gridRow: 13 },
  25: { gridColumn: 3, gridRow: 13 },
  // === NOUVEAUX STANDS AUTOUR DES TABLES (26-40) ===
  // Rangée au-dessus des Tables
  26: { gridColumn: 3, gridRow: 5 },
  27: { gridColumn: 4, gridRow: 5 },
  28: { gridColumn: 5, gridRow: 5 },
  29: { gridColumn: 6, gridRow: 5 },
  30: { gridColumn: 7, gridRow: 5 },
  // Côté gauche des Tables
  31: { gridColumn: 2, gridRow: 6 },
  32: { gridColumn: 2, gridRow: 8 },
  // Côté droit des Tables
  33: { gridColumn: 8, gridRow: 6 },
  34: { gridColumn: 8, gridRow: 7 },
  35: { gridColumn: 8, gridRow: 8 },
  // Rangée en-dessous des Tables
  36: { gridColumn: 3, gridRow: 9 },
  37: { gridColumn: 4, gridRow: 9 },
  38: { gridColumn: 5, gridRow: 9 },
  39: { gridColumn: 6, gridRow: 9 },
  40: { gridColumn: 7, gridRow: 9 },
}

const statusConfig = {
  FREE: { label: 'Libre', color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
  RESERVED: { label: 'Réservé', color: 'bg-orange-400', hoverColor: 'hover:bg-orange-500' },
  SOLD: { label: 'Vendu', color: 'bg-red-400', hoverColor: 'hover:bg-red-500' },
}

export function AdminInteractiveStandPlan({
  stands,
  onStandClick,
  onStatusChange,
  loading = false,
}: AdminStandPlanProps) {
  const [selectedStand, setSelectedStand] = useState<StandWithPosition | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [quickEditMode, setQuickEditMode] = useState(false)

  // Map stands with positions - use row/col from database, fallback to hardcoded positions
  const standsWithPositions = useMemo((): StandWithPosition[] => {
    return stands.map(stand => ({
      ...stand,
      position: stand.row && stand.col
        ? { gridColumn: stand.col, gridRow: stand.row }
        : defaultStandPositions[stand.number] || { gridColumn: 1, gridRow: 1 }
    }))
  }, [stands])

  // Filter stands
  const filteredStands = useMemo(() => {
    if (statusFilter === 'all') return standsWithPositions
    return standsWithPositions.filter((stand) => stand.status === statusFilter)
  }, [standsWithPositions, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const free = stands.filter((s) => s.status === 'FREE').length
    const reserved = stands.filter((s) => s.status === 'RESERVED').length
    const sold = stands.filter((s) => s.status === 'SOLD').length
    const revenue = stands.filter((s) => s.status === 'SOLD').reduce((sum, s) => sum + s.priceHT, 0)
    return { free, reserved, sold, total: stands.length, revenue }
  }, [stands])

  const handleStandClick = (stand: StandWithPosition) => {
    if (quickEditMode && onStatusChange) {
      // Cycle through statuses: FREE -> RESERVED -> SOLD -> FREE
      const nextStatus = stand.status === 'FREE' ? 'RESERVED' : stand.status === 'RESERVED' ? 'SOLD' : 'FREE'
      onStatusChange(stand.id, nextStatus)
    } else {
      setSelectedStand(stand)
      onStandClick?.(stand)
    }
  }

  const handleStatusChange = (newStatus: 'FREE' | 'RESERVED' | 'SOLD') => {
    if (selectedStand && onStatusChange) {
      onStatusChange(selectedStand.id, newStatus)
      setSelectedStand({ ...selectedStand, status: newStatus })
    }
  }

  const getStandPosition = (stand: StandWithPosition) => {
    return stand.position || defaultStandPositions[stand.number] || { gridColumn: 1, gridRow: 1 }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-12 h-12 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header with filters and quick edit mode */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-forest focus:border-transparent"
          >
            <option value="all">Tous ({stats.total})</option>
            <option value="FREE">Libres ({stats.free})</option>
            <option value="RESERVED">Réservés ({stats.reserved})</option>
            <option value="SOLD">Vendus ({stats.sold})</option>
          </select>
        </div>

        {/* Quick Edit Mode Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={quickEditMode}
            onChange={(e) => setQuickEditMode(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest"
          />
          <span className="text-sm text-gray-700">Mode édition rapide</span>
          {quickEditMode && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
              Clic = changer statut
            </span>
          )}
        </label>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-gray-600">Libre ({stats.free})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-400" />
          <span className="text-gray-600">Réservé ({stats.reserved})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-400" />
          <span className="text-gray-600">Vendu ({stats.sold})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-dashed border-gray-400" />
          <span className="text-gray-600">Zone commune</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4">
        {/* Plan Grid */}
        <div className="flex-1 bg-gray-50 rounded-xl p-4 overflow-x-auto">
          <div
            className="grid gap-2 min-w-[550px]"
            style={{
              gridTemplateColumns: 'repeat(10, minmax(45px, 1fr))',
              gridTemplateRows: 'repeat(13, 45px)',
            }}
          >
            {/* Zones */}
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white/50"
                style={{
                  gridColumn: zone.position.gridColumn,
                  gridRow: zone.position.gridRow,
                }}
              >
                <div className="text-center px-1">
                  {zone.type === 'entry' && <span className="text-lg block">→</span>}
                  <span className="text-xs font-medium text-gray-500">{zone.name}</span>
                </div>
              </div>
            ))}

            {/* Stands */}
            {filteredStands.map((stand) => {
              const pos = getStandPosition(stand)
              const config = statusConfig[stand.status]
              return (
                <motion.button
                  key={stand.id}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStandClick(stand)}
                  className={`
                    rounded-lg flex flex-col items-center justify-center text-white text-xs font-bold
                    transition-all shadow-md cursor-pointer
                    ${config.color} ${config.hoverColor}
                    ${selectedStand?.id === stand.id ? 'ring-4 ring-forest ring-offset-2' : ''}
                  `}
                  style={{
                    gridColumn: pos.gridColumn,
                    gridRow: pos.gridRow,
                  }}
                  title={`Stand ${stand.number} - ${config.label}${stand.exhibitorName ? ` - ${stand.exhibitorName}` : ''}`}
                >
                  <span className="font-bold">{stand.number}</span>
                  {stand.exhibitorName && (
                    <span className="text-[8px] opacity-80 truncate max-w-full px-1">
                      {stand.exhibitorName.slice(0, 6)}
                    </span>
                  )}
                </motion.button>
              )
            })}

            {/* Hidden stands (filtered out) - show as gray */}
            {standsWithPositions
              .filter((s) => !filteredStands.includes(s))
              .map((stand) => {
                const pos = getStandPosition(stand)
                return (
                  <div
                    key={stand.id}
                    className="rounded-lg flex items-center justify-center bg-gray-200 text-gray-400 text-xs opacity-40"
                    style={{
                      gridColumn: pos.gridColumn,
                      gridRow: pos.gridRow,
                    }}
                  >
                    {stand.number}
                  </div>
                )
              })}
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
              className="w-full xl:w-72 bg-white rounded-xl shadow-lg p-4 border"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Stand {selectedStand.number}
                  </h3>
                  <p className="text-gray-500 text-sm">{selectedStand.surfaceM2} m²</p>
                </div>
                <button
                  onClick={() => setSelectedStand(null)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Quick Status Buttons */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Changer le statut :</p>
                <div className="flex gap-1">
                  {(['FREE', 'RESERVED', 'SOLD'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`
                        flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all
                        ${selectedStand.status === status
                          ? `${statusConfig[status].color} text-white ring-2 ring-offset-1 ring-gray-400`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {statusConfig[status].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Prix HT</span>
                  <span className="font-bold text-forest">{selectedStand.priceHT} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taille</span>
                  <span className="text-gray-900">{selectedStand.size}</span>
                </div>
                {selectedStand.exhibitorName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Exposant</span>
                    <span className="text-gray-900 font-medium">{selectedStand.exhibitorName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Options</span>
                  <div className="flex gap-1">
                    {selectedStand.hasFurniture && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Mobilier</span>
                    )}
                    {selectedStand.hasElectricity && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Élec</span>
                    )}
                    {!selectedStand.hasFurniture && !selectedStand.hasElectricity && (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="mt-4 pt-3 border-t">
                <Button
                  onClick={() => onStandClick?.(selectedStand)}
                  className="w-full"
                  size="sm"
                >
                  Modifier les détails
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full xl:w-72 bg-gray-50 rounded-xl p-4 flex items-center justify-center border-2 border-dashed border-gray-200"
            >
              <div className="text-center py-8">
                <svg
                  className="w-10 h-10 text-gray-300 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                <p className="text-gray-400 text-sm">
                  Sélectionnez un stand
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Revenue Info */}
      <div className="mt-4 bg-forest/5 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm text-gray-600">Chiffre d&apos;affaires (stands vendus)</span>
        <span className="text-lg font-bold text-forest">{stats.revenue.toLocaleString('fr-FR')} € HT</span>
      </div>
    </div>
  )
}

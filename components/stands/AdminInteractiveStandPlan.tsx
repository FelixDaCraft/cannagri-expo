'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
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

interface PendingPosition {
  x: number
  y: number
  width: number
  height: number
}

interface AdminStandPlanProps {
  stands: AdminStand[]
  onStandClick?: (stand: AdminStand) => void
  onStatusChange?: (standId: string, newStatus: 'FREE' | 'RESERVED' | 'SOLD') => void
  onPositionChange?: (standId: string, x: number, y: number, width: number, height: number) => void
  onBatchPositionChange?: (changes: Array<{ standId: string; x: number; y: number; width: number; height: number }>) => Promise<void>
  loading?: boolean
}

// Plan dimensions
const PLAN_WIDTH = 700
const PLAN_HEIGHT = 550

// Zones de la salle avec couleurs et icônes
const zones: Zone[] = [
  {
    id: 'CONF',
    name: 'Conférences',
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
    name: 'Entrée',
    icon: '🚪',
    x: 10, y: 450, width: 100, height: 80,
    bgColor: 'bg-purple-50/80',
    borderColor: 'border-purple-200'
  },
]

// Taille uniforme pour tous les stands (carres)
const STAND_SIZE = 45

// Default stand positions (x, y) - tous les stands ont la meme taille
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

const statusConfig = {
  FREE: {
    label: 'Libre',
    bgClass: 'bg-gradient-to-br from-green-400 to-green-600',
    hoverClass: 'hover:from-green-500 hover:to-green-700',
    shadowClass: 'shadow-green-500/30',
    glowClass: 'hover:shadow-green-400/50'
  },
  RESERVED: {
    label: 'Réservé',
    bgClass: 'bg-gradient-to-br from-orange-400 to-orange-600',
    hoverClass: 'hover:from-orange-500 hover:to-orange-700',
    shadowClass: 'shadow-orange-500/30',
    glowClass: 'hover:shadow-orange-400/50'
  },
  SOLD: {
    label: 'Vendu',
    bgClass: 'bg-gradient-to-br from-red-400 to-red-600',
    hoverClass: 'hover:from-red-500 hover:to-red-700',
    shadowClass: 'shadow-red-500/30',
    glowClass: 'hover:shadow-red-400/50'
  },
}

export function AdminInteractiveStandPlan({
  stands,
  onStandClick,
  onStatusChange,
  onPositionChange,
  onBatchPositionChange,
  loading = false,
}: AdminStandPlanProps) {
  const [selectedStand, setSelectedStand] = useState<AdminStand | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [quickEditMode, setQuickEditMode] = useState(false)
  const [dragMode, setDragMode] = useState(false)
  const [draggingStand, setDraggingStand] = useState<string | null>(null)
  const [pendingPositions, setPendingPositions] = useState<Map<string, PendingPosition>>(new Map())
  const [dragOffsets, setDragOffsets] = useState<Map<string, { x: number; y: number }>>(new Map())
  const [isSaving, setIsSaving] = useState(false)
  const planRef = useRef<HTMLDivElement>(null)

  // Check if there are unsaved changes
  const hasUnsavedChanges = pendingPositions.size > 0

  // Get stand position (from pending changes, DB, or default)
  const getStandPosition = useCallback((stand: AdminStand) => {
    // Check pending positions first
    const pending = pendingPositions.get(stand.id)
    if (pending) {
      return pending
    }
    // Then check DB values
    if (stand.x !== undefined && stand.y !== undefined && stand.width && stand.height) {
      return { x: stand.x, y: stand.y, width: stand.width, height: stand.height }
    }
    // Fall back to default
    return defaultStandConfig[stand.number] || { x: 0, y: 0, width: STAND_SIZE, height: STAND_SIZE }
  }, [pendingPositions])

  // Filter stands
  const filteredStands = useMemo(() => {
    if (statusFilter === 'all') return stands
    return stands.filter((stand) => stand.status === statusFilter)
  }, [stands, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const free = stands.filter((s) => s.status === 'FREE').length
    const reserved = stands.filter((s) => s.status === 'RESERVED').length
    const sold = stands.filter((s) => s.status === 'SOLD').length
    const revenue = stands.filter((s) => s.status === 'SOLD').reduce((sum, s) => sum + s.priceHT, 0)
    return { free, reserved, sold, total: stands.length, revenue }
  }, [stands])

  const handleStandClick = (stand: AdminStand) => {
    if (quickEditMode && onStatusChange) {
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

  // Handle drag - track offset during drag
  const handleDrag = useCallback((stand: AdminStand, info: { offset: { x: number; y: number } }) => {
    setDragOffsets(prev => {
      const newMap = new Map(prev)
      newMap.set(stand.id, { x: info.offset.x, y: info.offset.y })
      return newMap
    })
  }, [])

  // Handle drag end - store position locally (batch mode)
  const handleDragEnd = useCallback((stand: AdminStand, info: { offset: { x: number; y: number } }) => {
    if (!planRef.current) return

    // Get the base position (original, not from pending)
    const basePos = (stand.x !== undefined && stand.y !== undefined && stand.width && stand.height)
      ? { x: stand.x, y: stand.y, width: stand.width, height: stand.height }
      : defaultStandConfig[stand.number] || { x: 0, y: 0, width: STAND_SIZE, height: STAND_SIZE }

    // Get current pending offset if any
    const existingPending = pendingPositions.get(stand.id)
    const currentX = existingPending ? existingPending.x : basePos.x
    const currentY = existingPending ? existingPending.y : basePos.y

    // Calculate new position
    const newX = Math.max(0, Math.min(PLAN_WIDTH - basePos.width, currentX + info.offset.x))
    const newY = Math.max(0, Math.min(PLAN_HEIGHT - basePos.height, currentY + info.offset.y))

    // Store in pending positions (batch mode)
    setPendingPositions(prev => {
      const newMap = new Map(prev)
      newMap.set(stand.id, {
        x: Math.round(newX),
        y: Math.round(newY),
        width: basePos.width,
        height: basePos.height
      })
      return newMap
    })

    // Clear drag offset for this stand
    setDragOffsets(prev => {
      const newMap = new Map(prev)
      newMap.delete(stand.id)
      return newMap
    })

    setDraggingStand(null)
  }, [pendingPositions])

  // Save all pending positions
  const handleSavePositions = useCallback(async () => {
    if (pendingPositions.size === 0) return

    setIsSaving(true)
    try {
      if (onBatchPositionChange) {
        // Use batch save if available
        const changes = Array.from(pendingPositions.entries()).map(([standId, pos]) => ({
          standId,
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height
        }))
        await onBatchPositionChange(changes)
      } else if (onPositionChange) {
        // Fallback to individual saves
        Array.from(pendingPositions.entries()).forEach(([standId, pos]) => {
          onPositionChange(standId, pos.x, pos.y, pos.width, pos.height)
        })
      }
      // Clear pending after successful save
      setPendingPositions(new Map())
    } catch (error) {
      console.error('Failed to save positions:', error)
    } finally {
      setIsSaving(false)
    }
  }, [pendingPositions, onBatchPositionChange, onPositionChange])

  // Reset pending positions
  const handleResetPositions = useCallback(() => {
    setPendingPositions(new Map())
    setDragOffsets(new Map())
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-12 h-12 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header with filters and modes */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-forest focus:border-transparent shadow-sm"
          >
            <option value="all">Tous ({stats.total})</option>
            <option value="FREE">Libres ({stats.free})</option>
            <option value="RESERVED">Réservés ({stats.reserved})</option>
            <option value="SOLD">Vendus ({stats.sold})</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Drag Mode Toggle */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={dragMode}
              onChange={(e) => {
                setDragMode(e.target.checked)
                if (e.target.checked) setQuickEditMode(false)
              }}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Mode deplacement</span>
            {dragMode && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                Glisser-deposer
              </span>
            )}
          </label>

          {/* Quick Edit Mode Toggle */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={quickEditMode}
              onChange={(e) => {
                setQuickEditMode(e.target.checked)
                if (e.target.checked) setDragMode(false)
              }}
              className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Mode edition rapide</span>
            {quickEditMode && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                Clic = changer statut
              </span>
            )}
          </label>

          {/* Save/Reset buttons when there are pending changes */}
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium">
                {pendingPositions.size} modification{pendingPositions.size > 1 ? 's' : ''}
              </span>
              <Button
                onClick={handleSavePositions}
                disabled={isSaving}
                size="sm"
                className="bg-forest hover:bg-forest/90"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button
                onClick={handleResetPositions}
                disabled={isSaving}
                size="sm"
                variant="outline"
              >
                Annuler
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-gradient-to-br from-green-400 to-green-600 shadow-sm" />
          <span className="text-gray-600">Libre ({stats.free})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm" />
          <span className="text-gray-600">Réservé ({stats.reserved})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-gradient-to-br from-red-400 to-red-600 shadow-sm" />
          <span className="text-gray-600">Vendu ({stats.sold})</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4">
        {/* Plan Canvas */}
        <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-2xl p-4 overflow-x-auto shadow-inner">
          <div
            ref={planRef}
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
                const pos = getStandPosition(stand)
                const config = statusConfig[stand.status]
                const isDragging = draggingStand === stand.id
                const hasPendingChange = pendingPositions.has(stand.id)

                return (
                  <motion.button
                    key={`${stand.id}-${pos.x}-${pos.y}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      delay: index * 0.02,
                      type: 'spring',
                      stiffness: 300,
                      damping: 25
                    }}
                    drag={dragMode}
                    dragMomentum={false}
                    dragElastic={0}
                    dragConstraints={planRef}
                    onDragStart={() => setDraggingStand(stand.id)}
                    onDrag={(_, info) => handleDrag(stand, info)}
                    onDragEnd={(_, info) => handleDragEnd(stand, info)}
                    whileHover={!dragMode ? { scale: 1.08, zIndex: 20 } : { zIndex: 30 }}
                    whileTap={!dragMode ? { scale: 0.95 } : {}}
                    whileDrag={{ scale: 1.15, zIndex: 50 }}
                    onClick={() => !dragMode && handleStandClick(stand)}
                    className={`
                      absolute rounded-xl flex flex-col items-center justify-center text-white font-bold
                      shadow-lg transition-all duration-200
                      ${config.bgClass} ${config.hoverClass}
                      ${selectedStand?.id === stand.id ? 'ring-4 ring-forest ring-offset-2' : ''}
                      ${hasPendingChange ? 'ring-2 ring-amber-400 ring-offset-1' : ''}
                      ${dragMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                      ${isDragging ? `shadow-2xl ${config.glowClass}` : config.shadowClass}
                      hover:shadow-xl ${config.glowClass}
                    `}
                    style={{
                      left: pos.x,
                      top: pos.y,
                      width: pos.width,
                      height: pos.height,
                    }}
                    title={`Stand ${stand.number} - ${config.label}${stand.exhibitorName ? ` - ${stand.exhibitorName}` : ''}${dragMode ? ' (glisser pour deplacer)' : ''}${hasPendingChange ? ' (non sauvegarde)' : ''}`}
                  >
                    <span className="font-bold text-sm drop-shadow-sm">{stand.number}</span>
                    {hasPendingChange && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
                    )}
                  </motion.button>
                )
              })}
            </AnimatePresence>

            {/* Hidden stands (filtered out) */}
            {stands
              .filter((s) => !filteredStands.includes(s))
              .map((stand) => {
                const pos = getStandPosition(stand)
                return (
                  <div
                    key={stand.id}
                    className="absolute rounded-xl flex items-center justify-center bg-gray-200/50 text-gray-400 text-xs border border-gray-300/50"
                    style={{
                      left: pos.x,
                      top: pos.y,
                      width: pos.width,
                      height: pos.height,
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
              className="w-full xl:w-80 bg-white rounded-2xl shadow-xl p-5 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Stand {selectedStand.number}
                  </h3>
                  <p className="text-gray-500 text-sm">{selectedStand.surfaceM2} m² • {getStandPosition(selectedStand).width}x{getStandPosition(selectedStand).height}px</p>
                </div>
                <button
                  onClick={() => setSelectedStand(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Quick Status Buttons */}
              <div className="mb-5">
                <p className="text-xs text-gray-500 mb-2 font-medium">Changer le statut :</p>
                <div className="flex gap-2">
                  {(['FREE', 'RESERVED', 'SOLD'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`
                        flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all
                        ${selectedStand.status === status
                          ? `${statusConfig[status].bgClass} text-white shadow-lg`
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
              <div className="space-y-3 text-sm border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Prix</span>
                  <span className="font-bold text-lg text-forest">{selectedStand.priceHT} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Position</span>
                  <span className="text-gray-700 font-mono text-xs">
                    x:{getStandPosition(selectedStand).x} y:{getStandPosition(selectedStand).y}
                  </span>
                </div>
                {selectedStand.exhibitorName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Exposant</span>
                    <span className="text-gray-900 font-medium">{selectedStand.exhibitorName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Services</span>
                  <div className="flex gap-1">
                    {selectedStand.hasFurniture && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">🪑 Mobilier</span>
                    )}
                    {selectedStand.hasElectricity && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⚡ Élec</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="mt-5 pt-4 border-t">
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
              className="w-full xl:w-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 flex items-center justify-center border-2 border-dashed border-gray-200"
            >
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200/50 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  Sélectionnez un stand
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  pour voir ses détails
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Revenue Info */}
      <div className="mt-4 bg-gradient-to-r from-forest/5 to-forest/10 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-gray-600 font-medium">Chiffre d&apos;affaires (stands vendus)</span>
        <span className="text-xl font-bold text-forest">{stats.revenue.toLocaleString('fr-FR')} € HT</span>
      </div>
    </div>
  )
}

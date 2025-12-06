'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn, formatPrice } from '@/lib/utils'
import { StandBookingModal } from './StandBookingModal'

export type StandStatus = 'FREE' | 'RESERVED' | 'SOLD'
export type StandSize = 'SMALL' | 'MEDIUM' | 'LARGE'

export interface Stand {
  id: string
  code: string
  number: number
  surfaceM2: number
  priceHT: number
  status: StandStatus
  size: StandSize
  x: number
  y: number
  width: number
  height: number
  hasFurniture: boolean
  hasElectricity: boolean
  furniturePrice: number
  electricityPrice: number
  exhibitorName?: string
}

interface StandPlanProps {
  stands?: Stand[]
  onStandSelect?: (stand: Stand) => void
  readOnly?: boolean
  showLegend?: boolean
  adminMode?: boolean
  onStandEdit?: (stand: Stand) => void
}

// 25 stands disposés comme sur le vrai plan du salon
const defaultStands: Stand[] = [
  // Rangée du haut (stands 3-9)
  { id: '3', code: '3', number: 3, surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', x: 200, y: 50, width: 55, height: 55, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '4', code: '4', number: 4, surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', x: 265, y: 50, width: 55, height: 55, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '5', code: '5', number: 5, surfaceM2: 9, priceHT: 350, status: 'RESERVED', size: 'SMALL', x: 330, y: 50, width: 55, height: 55, hasFurniture: false, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '6', code: '6', number: 6, surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', x: 395, y: 50, width: 55, height: 55, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '7', code: '7', number: 7, surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', x: 460, y: 50, width: 55, height: 55, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '8', code: '8', number: 8, surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', x: 525, y: 50, width: 55, height: 55, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '9', code: '9', number: 9, surfaceM2: 9, priceHT: 350, status: 'SOLD', size: 'SMALL', x: 590, y: 50, width: 55, height: 55, hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80, exhibitorName: 'CBD Factory' },

  // Stands 1-2 (à côté de la salle conférence)
  { id: '2', code: '2', number: 2, surfaceM2: 12, priceHT: 450, status: 'RESERVED', size: 'MEDIUM', x: 200, y: 130, width: 55, height: 65, hasFurniture: false, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '1', code: '1', number: 1, surfaceM2: 12, priceHT: 450, status: 'FREE', size: 'MEDIUM', x: 200, y: 205, width: 55, height: 65, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },

  // Côté droit vertical (stands 10-18)
  { id: '10', code: '10', number: 10, surfaceM2: 9, priceHT: 350, status: 'SOLD', size: 'SMALL', x: 590, y: 130, width: 55, height: 45, hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80, exhibitorName: 'GreenLeaf' },
  { id: '11', code: '11', number: 11, surfaceM2: 9, priceHT: 350, status: 'RESERVED', size: 'SMALL', x: 590, y: 185, width: 55, height: 45, hasFurniture: false, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '12', code: '12', number: 12, surfaceM2: 9, priceHT: 350, status: 'SOLD', size: 'SMALL', x: 590, y: 240, width: 55, height: 45, hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80, exhibitorName: 'HempTech' },
  { id: '13', code: '13', number: 13, surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', x: 590, y: 295, width: 55, height: 45, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '14', code: '14', number: 14, surfaceM2: 9, priceHT: 350, status: 'SOLD', size: 'SMALL', x: 590, y: 350, width: 55, height: 45, hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80, exhibitorName: 'Bio Hemp' },
  { id: '15', code: '15', number: 15, surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', x: 590, y: 405, width: 55, height: 45, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '16', code: '16', number: 16, surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', x: 590, y: 460, width: 55, height: 45, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '17', code: '17', number: 17, surfaceM2: 9, priceHT: 350, status: 'RESERVED', size: 'SMALL', x: 590, y: 515, width: 55, height: 45, hasFurniture: false, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '18', code: '18', number: 18, surfaceM2: 9, priceHT: 350, status: 'SOLD', size: 'SMALL', x: 590, y: 570, width: 55, height: 45, hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80, exhibitorName: 'CBD King' },

  // Rangée du bas (stands 25-19, de gauche à droite)
  { id: '25', code: '25', number: 25, surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', x: 200, y: 570, width: 55, height: 55, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '24', code: '24', number: 24, surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', x: 265, y: 570, width: 55, height: 55, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '23', code: '23', number: 23, surfaceM2: 9, priceHT: 350, status: 'RESERVED', size: 'SMALL', x: 330, y: 570, width: 55, height: 55, hasFurniture: false, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '22', code: '22', number: 22, surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', x: 395, y: 570, width: 55, height: 55, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '21', code: '21', number: 21, surfaceM2: 9, priceHT: 350, status: 'SOLD', size: 'SMALL', x: 460, y: 570, width: 55, height: 55, hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80, exhibitorName: 'Natura' },
  { id: '20', code: '20', number: 20, surfaceM2: 9, priceHT: 350, status: 'RESERVED', size: 'SMALL', x: 525, y: 570, width: 55, height: 55, hasFurniture: false, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '19', code: '19', number: 19, surfaceM2: 9, priceHT: 350, status: 'SOLD', size: 'SMALL', x: 590, y: 625, width: 55, height: 55, hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80, exhibitorName: 'Hemp+' },
]

const statusColors = {
  FREE: { fill: '#dcfce7', stroke: '#22c55e', text: '#166534', label: 'Libre' },
  RESERVED: { fill: '#fed7aa', stroke: '#f97316', text: '#9a3412', label: 'Réservé' },
  SOLD: { fill: '#fecaca', stroke: '#ef4444', text: '#991b1b', label: 'Vendu' },
}

type FilterType = 'all' | 'FREE' | 'RESERVED' | 'SOLD'

export function StandPlan({
  stands,
  onStandSelect,
  readOnly = false,
  showLegend = true,
  adminMode = false,
  onStandEdit
}: StandPlanProps) {
  const [hoveredStand, setHoveredStand] = useState<Stand | null>(null)
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [localStands, setLocalStands] = useState<Stand[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    if (stands && stands.length > 0) {
      setLocalStands(stands.map(s => ({ ...s, status: s.status as StandStatus, size: (s.size || 'MEDIUM') as StandSize })))
      setLoading(false)
    } else {
      fetch('/api/stands')
        .then(res => res.json())
        .then(data => {
          if (data.data && data.data.length > 0) {
            setLocalStands(data.data.map((s: any) => ({ ...s, status: s.status as StandStatus, size: (s.size || 'MEDIUM') as StandSize })))
          } else {
            setLocalStands(defaultStands)
          }
        })
        .catch(() => {
          setLocalStands(defaultStands)
        })
        .finally(() => setLoading(false))
    }
  }, [stands])

  const handleStandClick = (stand: Stand) => {
    if (adminMode && onStandEdit) {
      onStandEdit(stand)
      return
    }
    if (stand.status !== 'FREE' || readOnly) return
    setSelectedStand(stand)
    setShowModal(true)
    onStandSelect?.(stand)
  }

  const filteredStands = filter === 'all'
    ? localStands
    : localStands.filter(s => s.status === filter)

  const stats = {
    total: localStands.length,
    free: localStands.filter(s => s.status === 'FREE').length,
    reserved: localStands.filter(s => s.status === 'RESERVED').length,
    sold: localStands.filter(s => s.status === 'SOLD').length,
  }

  if (loading) {
    return (
      <div className="w-full bg-cream/50 rounded-xl p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
          <p className="text-forest/60">Chargement du plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Filter buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <span className="text-sm font-medium text-forest self-center mr-2">Filtrer :</span>
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            filter === 'all'
              ? 'bg-forest text-white'
              : 'bg-white border border-gray-200 text-forest hover:bg-gray-50'
          )}
        >
          Tous les stands
        </button>
        <button
          onClick={() => setFilter('FREE')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            filter === 'FREE'
              ? 'bg-green-500 text-white'
              : 'bg-white border border-gray-200 text-forest hover:bg-gray-50'
          )}
        >
          Libres
        </button>
        <button
          onClick={() => setFilter('RESERVED')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            filter === 'RESERVED'
              ? 'bg-orange-500 text-white'
              : 'bg-white border border-gray-200 text-forest hover:bg-gray-50'
          )}
        >
          Réservés
        </button>
        <button
          onClick={() => setFilter('SOLD')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            filter === 'SOLD'
              ? 'bg-red-500 text-white'
              : 'bg-white border border-gray-200 text-forest hover:bg-gray-50'
          )}
        >
          Vendus
        </button>
      </div>

      {/* SVG Plan */}
      <div className="relative bg-white rounded-2xl p-4 overflow-x-auto border border-gray-200">
        <svg
          viewBox="0 0 700 720"
          className="w-full h-auto min-w-[500px]"
          style={{ maxHeight: '700px' }}
        >
          {/* Zone Conférences (top left, dashed border) */}
          <rect
            x="30"
            y="50"
            width="150"
            height="220"
            fill="#f5f5f4"
            stroke="#a8a29e"
            strokeWidth="2"
            strokeDasharray="8,4"
            rx="4"
          />
          <text x="105" y="165" textAnchor="middle" fill="#78716c" fontSize="14" fontWeight="600">
            CONFÉRENCES
          </text>

          {/* Zone BAR (left side) */}
          <rect
            x="30"
            y="300"
            width="150"
            height="140"
            fill="#dcfce7"
            stroke="#86efac"
            strokeWidth="2"
            rx="4"
            opacity="0.5"
          />
          <text x="105" y="375" textAnchor="middle" fill="#166534" fontSize="18" fontWeight="bold">
            BAR
          </text>

          {/* Zone TABLES (center) */}
          <rect
            x="280"
            y="280"
            width="180"
            height="100"
            fill="#f5f5f4"
            stroke="#d6d3d1"
            strokeWidth="2"
            rx="4"
          />
          <text x="370" y="335" textAnchor="middle" fill="#78716c" fontSize="14" fontWeight="600">
            TABLES
          </text>

          {/* Entrée (bottom left) */}
          <g transform="translate(50, 520)">
            <rect x="0" y="0" width="50" height="50" fill="white" stroke="#3D5A45" strokeWidth="2" rx="4" />
            <polygon points="25,35 15,20 35,20" fill="#3D5A45" />
            <text x="25" y="62" textAnchor="middle" fill="#3D5A45" fontSize="11" fontWeight="600">
              ENTRÉE
            </text>
          </g>

          {/* Stands */}
          {localStands.map((stand) => {
            const isHovered = hoveredStand?.id === stand.id
            const isFiltered = filter !== 'all' && stand.status !== filter
            const isClickable = (stand.status === 'FREE' && !readOnly) || adminMode
            const colors = statusColors[stand.status]

            return (
              <g
                key={stand.id}
                onClick={() => !isFiltered && handleStandClick(stand)}
                onMouseEnter={() => !isFiltered && setHoveredStand(stand)}
                onMouseLeave={() => setHoveredStand(null)}
                className={cn(
                  'transition-all duration-200',
                  !isFiltered && isClickable && 'cursor-pointer'
                )}
                opacity={isFiltered ? 0.2 : 1}
                style={{ filter: isHovered && !isFiltered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none' }}
              >
                <rect
                  x={stand.x}
                  y={stand.y}
                  width={stand.width}
                  height={stand.height}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isHovered ? 3 : 2}
                  rx="4"
                />
                <text
                  x={stand.x + stand.width / 2}
                  y={stand.y + stand.height / 2 + 5}
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize="16"
                  fontWeight="bold"
                >
                  {stand.number}
                </text>
                {/* Checkmark for confirmed stands */}
                {stand.status === 'SOLD' && (
                  <text
                    x={stand.x + stand.width / 2}
                    y={stand.y + stand.height - 8}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="10"
                  >
                    ✓
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hoveredStand && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-4 right-4 bg-white rounded-xl shadow-lg p-4 z-10 min-w-[200px] border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-bold text-lg text-forest">Stand {hoveredStand.number}</span>
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  hoveredStand.status === 'FREE' && 'bg-green-100 text-green-800',
                  hoveredStand.status === 'RESERVED' && 'bg-orange-100 text-orange-800',
                  hoveredStand.status === 'SOLD' && 'bg-red-100 text-red-800'
                )}>
                  {statusColors[hoveredStand.status].label}
                </span>
              </div>
              <div className="space-y-1 text-sm text-forest/80">
                <p><span className="font-medium">Surface:</span> {hoveredStand.surfaceM2} m²</p>
                <p><span className="font-medium">Prix:</span> {formatPrice(hoveredStand.priceHT)} HT</p>
                {hoveredStand.exhibitorName && (
                  <p><span className="font-medium">Exposant:</span> {hoveredStand.exhibitorName}</p>
                )}
              </div>
              {hoveredStand.status === 'FREE' && !readOnly && !adminMode && (
                <p className="mt-2 text-xs text-green-600 font-medium">Cliquez pour réserver</p>
              )}
              {adminMode && (
                <p className="mt-2 text-xs text-forest font-medium">Cliquez pour modifier</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border-2" style={{ backgroundColor: statusColors.FREE.fill, borderColor: statusColors.FREE.stroke }} />
            <span className="text-sm text-forest">Libre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border-2" style={{ backgroundColor: statusColors.RESERVED.fill, borderColor: statusColors.RESERVED.stroke }} />
            <span className="text-sm text-forest">Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border-2" style={{ backgroundColor: statusColors.SOLD.fill, borderColor: statusColors.SOLD.stroke }} />
            <span className="text-sm text-forest">Vendu</span>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedStand && !adminMode && (
        <StandBookingModal
          stand={selectedStand}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedStand(null)
          }}
        />
      )}
    </div>
  )
}

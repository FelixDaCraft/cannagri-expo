'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn, formatPrice } from '@/lib/utils'
import { StandBookingModal } from './StandBookingModal'

// Types définies localement pour éviter les problèmes d'import
export type StandStatus = 'FREE' | 'RESERVED' | 'SOLD'
export type StandSize = 'SMALL' | 'MEDIUM' | 'LARGE'

export interface Stand {
  id: string
  code: string
  surfaceM2: number
  priceHT: number
  status: StandStatus
  size: StandSize
  row: number
  col: number
  width?: number
  height?: number
  hasFurniture: boolean
  hasElectricity: boolean
  furniturePrice: number
  electricityPrice: number
  zone?: string
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

// 25 stands par défaut pour le salon
const defaultStands: Stand[] = [
  // Zone A - Entrée (6 stands)
  { id: '1', code: 'A1', surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', row: 0, col: 0, zone: 'A', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '2', code: 'A2', surfaceM2: 9, priceHT: 350, status: 'SOLD', size: 'SMALL', row: 0, col: 1, zone: 'A', hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80, exhibitorName: 'CBD Factory' },
  { id: '3', code: 'A3', surfaceM2: 12, priceHT: 450, status: 'FREE', size: 'MEDIUM', row: 0, col: 2, zone: 'A', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '4', code: 'A4', surfaceM2: 12, priceHT: 450, status: 'RESERVED', size: 'MEDIUM', row: 0, col: 3, zone: 'A', hasFurniture: false, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '5', code: 'A5', surfaceM2: 9, priceHT: 350, status: 'FREE', size: 'SMALL', row: 0, col: 4, zone: 'A', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '6', code: 'A6', surfaceM2: 9, priceHT: 350, status: 'SOLD', size: 'SMALL', row: 0, col: 5, zone: 'A', hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80, exhibitorName: 'GreenLeaf' },

  // Zone B - Centre gauche (6 stands)
  { id: '7', code: 'B1', surfaceM2: 12, priceHT: 450, status: 'FREE', size: 'MEDIUM', row: 1, col: 0, zone: 'B', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '8', code: 'B2', surfaceM2: 18, priceHT: 650, status: 'SOLD', size: 'MEDIUM', row: 1, col: 1, zone: 'B', hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80, exhibitorName: 'HempTech' },
  { id: '9', code: 'B3', surfaceM2: 12, priceHT: 450, status: 'FREE', size: 'MEDIUM', row: 1, col: 2, zone: 'B', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '10', code: 'B4', surfaceM2: 18, priceHT: 650, status: 'FREE', size: 'MEDIUM', row: 1, col: 3, zone: 'B', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '11', code: 'B5', surfaceM2: 12, priceHT: 450, status: 'RESERVED', size: 'MEDIUM', row: 1, col: 4, zone: 'B', hasFurniture: false, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '12', code: 'B6', surfaceM2: 12, priceHT: 450, status: 'FREE', size: 'MEDIUM', row: 1, col: 5, zone: 'B', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },

  // Zone C - Centre (7 stands dont 2 premium)
  { id: '13', code: 'C1', surfaceM2: 24, priceHT: 850, status: 'SOLD', size: 'LARGE', row: 2, col: 0, width: 2, zone: 'C', hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80, exhibitorName: 'CBD King Premium' },
  { id: '14', code: 'C2', surfaceM2: 12, priceHT: 450, status: 'FREE', size: 'MEDIUM', row: 2, col: 2, zone: 'C', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '15', code: 'C3', surfaceM2: 12, priceHT: 450, status: 'FREE', size: 'MEDIUM', row: 2, col: 3, zone: 'C', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '16', code: 'C4', surfaceM2: 24, priceHT: 850, status: 'FREE', size: 'LARGE', row: 2, col: 4, width: 2, zone: 'C', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '17', code: 'C5', surfaceM2: 18, priceHT: 650, status: 'RESERVED', size: 'MEDIUM', row: 3, col: 1, zone: 'C', hasFurniture: false, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '18', code: 'C6', surfaceM2: 18, priceHT: 650, status: 'FREE', size: 'MEDIUM', row: 3, col: 2, zone: 'C', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '19', code: 'C7', surfaceM2: 18, priceHT: 650, status: 'FREE', size: 'MEDIUM', row: 3, col: 3, zone: 'C', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },

  // Zone D - Fond près de la scène (6 stands premium)
  { id: '20', code: 'D1', surfaceM2: 18, priceHT: 750, status: 'SOLD', size: 'MEDIUM', row: 4, col: 0, zone: 'D', hasFurniture: true, hasElectricity: true, furniturePrice: 120, electricityPrice: 80, exhibitorName: 'Bio Hemp' },
  { id: '21', code: 'D2', surfaceM2: 24, priceHT: 950, status: 'FREE', size: 'LARGE', row: 4, col: 1, width: 2, zone: 'D', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '22', code: 'D3', surfaceM2: 24, priceHT: 950, status: 'RESERVED', size: 'LARGE', row: 4, col: 3, width: 2, zone: 'D', hasFurniture: false, hasElectricity: true, furniturePrice: 120, electricityPrice: 80 },
  { id: '23', code: 'D4', surfaceM2: 18, priceHT: 750, status: 'FREE', size: 'MEDIUM', row: 4, col: 5, zone: 'D', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '24', code: 'D5', surfaceM2: 36, priceHT: 1200, status: 'FREE', size: 'LARGE', row: 5, col: 1, width: 2, zone: 'D', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '25', code: 'D6', surfaceM2: 36, priceHT: 1200, status: 'FREE', size: 'LARGE', row: 5, col: 3, width: 2, zone: 'D', hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
]

const statusColors = {
  FREE: { bg: '#22c55e', hover: '#16a34a', label: 'Libre' },
  RESERVED: { bg: '#f97316', hover: '#ea580c', label: 'Réservé' },
  SOLD: { bg: '#ef4444', hover: '#dc2626', label: 'Vendu' },
}

const sizeLabels = {
  SMALL: 'Petit',
  MEDIUM: 'Moyen',
  LARGE: 'Grand',
}

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

  useEffect(() => {
    if (stands && stands.length > 0) {
      setLocalStands(stands.map(s => ({ ...s, status: s.status as StandStatus, size: (s.size || 'MEDIUM') as StandSize })))
      setLoading(false)
    } else {
      // Fetch from API
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

  // SVG dimensions and layout
  const svgWidth = 900
  const svgHeight = 700
  const standWidth = 120
  const standHeight = 80
  const gap = 15
  const offsetX = 50
  const offsetY = 60

  const getStandPosition = (stand: Stand) => {
    const x = offsetX + (stand.col * (standWidth + gap))
    const y = offsetY + (stand.row * (standHeight + gap))
    const width = (stand.width || 1) * standWidth + ((stand.width || 1) - 1) * gap
    return { x, y, width, height: standHeight }
  }

  // Stats
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
      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: statusColors.FREE.bg }} />
            <span className="text-sm font-medium text-forest">Libre ({stats.free})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: statusColors.RESERVED.bg }} />
            <span className="text-sm font-medium text-forest">Réservé ({stats.reserved})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: statusColors.SOLD.bg }} />
            <span className="text-sm font-medium text-forest">Vendu ({stats.sold})</span>
          </div>
        </div>
      )}

      {/* SVG Plan */}
      <div className="relative bg-gradient-to-b from-mint/20 to-cream rounded-2xl p-4 overflow-x-auto shadow-inner">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[600px]"
          style={{ maxHeight: '600px' }}
        >
          {/* Background pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3D5A45" strokeWidth="0.5" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Title */}
          <text x={svgWidth / 2} y="30" textAnchor="middle" className="fill-forest font-heading text-lg font-bold">
            Plan du Salon - L&apos;Agronaute
          </text>

          {/* Entry indicator */}
          <g transform={`translate(${svgWidth / 2 - 40}, ${svgHeight - 40})`}>
            <rect x="0" y="0" width="80" height="30" fill="#3D5A45" rx="4" />
            <text x="40" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">ENTRÉE</text>
            <path d="M 40 30 L 30 45 L 50 45 Z" fill="#3D5A45" />
          </g>

          {/* Stage */}
          <g transform={`translate(${offsetX}, ${offsetY + 5 * (standHeight + gap) + standHeight + 30})`}>
            <rect x="0" y="0" width={6 * (standWidth + gap) - gap} height="50" fill="#3D5A45" rx="6" />
            <text x={(6 * (standWidth + gap) - gap) / 2} y="32" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
              SCÈNE PRINCIPALE - PLATINUM CBD CUP
            </text>
          </g>

          {/* Zone labels */}
          {['A', 'B', 'C', 'D'].map((zone, i) => {
            const zoneStands = localStands.filter(s => s.zone === zone)
            if (zoneStands.length === 0) return null
            const minRow = Math.min(...zoneStands.map(s => s.row))
            const y = offsetY + minRow * (standHeight + gap) - 20
            return (
              <text key={zone} x="20" y={y + standHeight / 2} fill="#3D5A45" fontSize="14" fontWeight="bold" opacity="0.6">
                Zone {zone}
              </text>
            )
          })}

          {/* Stands */}
          {localStands.map((stand) => {
            const pos = getStandPosition(stand)
            const isHovered = hoveredStand?.id === stand.id
            const isClickable = stand.status === 'FREE' && !readOnly || adminMode
            const colors = statusColors[stand.status]

            return (
              <g
                key={stand.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => handleStandClick(stand)}
                onMouseEnter={() => setHoveredStand(stand)}
                onMouseLeave={() => setHoveredStand(null)}
                className={cn(
                  'transition-all duration-200',
                  isClickable && 'cursor-pointer'
                )}
                style={{ filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none' }}
              >
                {/* Stand background */}
                <rect
                  x="0"
                  y="0"
                  width={pos.width}
                  height={pos.height}
                  fill={isHovered && isClickable ? colors.hover : colors.bg}
                  rx="8"
                  className="transition-colors duration-200"
                />

                {/* Stand code */}
                <text
                  x={pos.width / 2}
                  y="25"
                  textAnchor="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                >
                  {stand.code}
                </text>

                {/* Surface */}
                <text
                  x={pos.width / 2}
                  y="45"
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  opacity="0.9"
                >
                  {stand.surfaceM2} m²
                </text>

                {/* Price */}
                <text
                  x={pos.width / 2}
                  y="62"
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  opacity="0.9"
                >
                  {formatPrice(stand.priceHT)} HT
                </text>

                {/* Sold badge with exhibitor name */}
                {stand.status === 'SOLD' && stand.exhibitorName && (
                  <text
                    x={pos.width / 2}
                    y={pos.height - 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                    opacity="0.8"
                  >
                    {stand.exhibitorName.length > 15 ? stand.exhibitorName.substring(0, 15) + '...' : stand.exhibitorName}
                  </text>
                )}

                {/* Size indicator */}
                {stand.size === 'LARGE' && (
                  <circle cx={pos.width - 12} cy="12" r="8" fill="white" fillOpacity="0.3" />
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
              className="absolute top-4 right-4 bg-white rounded-xl shadow-lg p-4 z-10 min-w-[200px]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-bold text-lg text-forest">{hoveredStand.code}</span>
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium text-white',
                  hoveredStand.status === 'FREE' && 'bg-green-500',
                  hoveredStand.status === 'RESERVED' && 'bg-orange-500',
                  hoveredStand.status === 'SOLD' && 'bg-red-500'
                )}>
                  {statusColors[hoveredStand.status].label}
                </span>
              </div>
              <div className="space-y-1 text-sm text-forest/80">
                <p><span className="font-medium">Surface:</span> {hoveredStand.surfaceM2} m²</p>
                <p><span className="font-medium">Type:</span> {sizeLabels[hoveredStand.size]}</p>
                <p><span className="font-medium">Prix:</span> {formatPrice(hoveredStand.priceHT)} HT</p>
                {hoveredStand.zone && <p><span className="font-medium">Zone:</span> {hoveredStand.zone}</p>}
                {hoveredStand.exhibitorName && <p><span className="font-medium">Exposant:</span> {hoveredStand.exhibitorName}</p>}
              </div>
              {hoveredStand.status === 'FREE' && !readOnly && !adminMode && (
                <p className="mt-2 text-xs text-terracotta font-medium">Cliquez pour réserver</p>
              )}
              {adminMode && (
                <p className="mt-2 text-xs text-forest font-medium">Cliquez pour modifier</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile instruction */}
      {!readOnly && !adminMode && (
        <p className="text-center text-sm text-forest/60 mt-4">
          Cliquez sur un stand vert pour le réserver
        </p>
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

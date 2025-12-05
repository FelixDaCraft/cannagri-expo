'use client'

import { useState } from 'react'
import { cn, formatPrice } from '@/lib/utils'
import { StandBookingModal } from './StandBookingModal'

// Types définis localement pour éviter les problèmes d'import
export type StandStatus = 'FREE' | 'RESERVED' | 'SOLD'

export interface Stand {
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

interface StandPlanProps {
  stands?: Stand[]
  onStandSelect?: (stand: Stand) => void
  readOnly?: boolean
}

// Mock stands for development
const defaultStands: Stand[] = [
  { id: '1', code: 'A1', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 0, col: 0, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '2', code: 'A2', surfaceM2: 12, priceHT: 450, status: 'SOLD', row: 0, col: 1, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '3', code: 'A3', surfaceM2: 18, priceHT: 650, status: 'FREE', row: 0, col: 2, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '4', code: 'A4', surfaceM2: 12, priceHT: 450, status: 'RESERVED', row: 0, col: 3, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '5', code: 'B1', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 1, col: 0, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '6', code: 'B2', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 1, col: 1, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '7', code: 'B3', surfaceM2: 18, priceHT: 650, status: 'SOLD', row: 1, col: 2, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '8', code: 'B4', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 1, col: 3, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '9', code: 'C1', surfaceM2: 24, priceHT: 850, status: 'FREE', row: 2, col: 0, width: 2, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '10', code: 'C2', surfaceM2: 12, priceHT: 450, status: 'RESERVED', row: 2, col: 2, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '11', code: 'C3', surfaceM2: 24, priceHT: 850, status: 'FREE', row: 2, col: 3, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
]

export function StandPlan({ stands, onStandSelect, readOnly = false }: StandPlanProps) {
  // Convertir les stands en type correct
  const typedStands: Stand[] = (stands || defaultStands).map(s => ({
    ...s,
    status: s.status as StandStatus
  }))

  const [selectedStand, setSelectedStand] = useState<Stand | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleStandClick = (stand: Stand) => {
    if (stand.status !== 'FREE' || readOnly) return
    setSelectedStand(stand)
    setShowModal(true)
    onStandSelect?.(stand)
  }

  const getStatusColor = (status: StandStatus) => {
    switch (status) {
      case 'FREE':
        return 'bg-green-500 hover:bg-green-600'
      case 'RESERVED':
        return 'bg-orange-500'
      case 'SOLD':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusLabel = (status: StandStatus) => {
    switch (status) {
      case 'FREE':
        return 'Libre'
      case 'RESERVED':
        return 'Réservé'
      case 'SOLD':
        return 'Vendu'
      default:
        return status
    }
  }

  // Calculate grid dimensions
  const maxRow = Math.max(...typedStands.map((s) => s.row)) + 1
  const maxCol = Math.max(...typedStands.map((s) => s.col + (s.width || 1) - 1)) + 1

  return (
    <div className="w-full">
      {/* Legend - Mobile optimized */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-4 sm:mb-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500" />
          <span className="text-xs sm:text-sm">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-orange-500" />
          <span className="text-xs sm:text-sm">Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-500" />
          <span className="text-xs sm:text-sm">Vendu</span>
        </div>
      </div>

      {/* Plan Grid - Responsive */}
      <div className="bg-gray-50 rounded-xl p-3 sm:p-6 overflow-x-auto">
        <div
          className="grid gap-1 sm:gap-2 min-w-max mx-auto"
          style={{
            gridTemplateColumns: `repeat(${maxCol}, minmax(60px, 1fr))`,
          }}
        >
          {typedStands.map((stand) => (
            <button
              key={stand.id}
              onClick={() => handleStandClick(stand)}
              disabled={stand.status !== 'FREE' || readOnly}
              className={cn(
                'rounded-lg flex flex-col items-center justify-center text-white font-semibold transition-all duration-200',
                'h-16 sm:h-20 p-1 sm:p-2',
                getStatusColor(stand.status),
                stand.status === 'FREE' && !readOnly && 'cursor-pointer hover:scale-105 hover:shadow-lg',
                stand.status !== 'FREE' && 'cursor-not-allowed opacity-90'
              )}
              style={{
                gridColumn: stand.width ? `span ${stand.width}` : 'span 1',
              }}
              title={`${stand.code} - ${stand.surfaceM2}m² - ${formatPrice(stand.priceHT)} - ${getStatusLabel(stand.status)}`}
            >
              <span className="text-sm sm:text-lg font-bold">{stand.code}</span>
              <span className="text-[10px] sm:text-xs opacity-80">{stand.surfaceM2}m²</span>
              <span className="text-[10px] sm:text-xs opacity-80 hidden sm:block">{formatPrice(stand.priceHT)}</span>
            </button>
          ))}
        </div>

        {/* Stage */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="bg-forest text-white rounded-lg py-2 sm:py-4 text-center font-heading font-semibold text-sm sm:text-base">
            SCÈNE PRINCIPALE
          </div>
        </div>
      </div>

      {/* Mobile tip */}
      {!readOnly && (
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-3">
          Appuyez sur un stand vert pour le réserver
        </p>
      )}

      {/* Booking Modal */}
      {selectedStand && (
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

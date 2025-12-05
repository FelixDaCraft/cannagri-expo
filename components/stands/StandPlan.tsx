'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getStandStatusColor, getStandStatusLabel, formatPrice } from '@/lib/utils'
import { StandBookingModal } from './StandBookingModal'

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
  stands: Stand[]
  onStandSelect?: (stand: Stand) => void
  readOnly?: boolean
}

// Mock stands for development
const mockStands: Stand[] = [
  { id: '1', code: 'A1', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 0, col: 0, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '2', code: 'A2', surfaceM2: 12, priceHT: 450, status: 'SOLD', row: 0, col: 1, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '3', code: 'A3', surfaceM2: 18, priceHT: 650, status: 'FREE', row: 0, col: 2, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '4', code: 'A4', surfaceM2: 12, priceHT: 450, status: 'RESERVED', row: 0, col: 3, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '5', code: 'A5', surfaceM2: 12, priceHT: 450, status: 'SOLD', row: 0, col: 4, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '6', code: 'A6', surfaceM2: 24, priceHT: 850, status: 'FREE', row: 0, col: 5, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '7', code: 'B1', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 1, col: 0, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '8', code: 'B2', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 1, col: 1, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '9', code: 'B3', surfaceM2: 18, priceHT: 650, status: 'SOLD', row: 1, col: 2, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '10', code: 'B4', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 1, col: 3, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '11', code: 'B5', surfaceM2: 12, priceHT: 450, status: 'SOLD', row: 1, col: 4, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '12', code: 'B6', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 1, col: 5, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '13', code: 'C1', surfaceM2: 24, priceHT: 850, status: 'FREE', row: 2, col: 0, width: 2, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '14', code: 'C2', surfaceM2: 12, priceHT: 450, status: 'RESERVED', row: 2, col: 2, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '15', code: 'C3', surfaceM2: 12, priceHT: 450, status: 'FREE', row: 2, col: 3, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
  { id: '16', code: 'C4', surfaceM2: 24, priceHT: 850, status: 'FREE', row: 2, col: 4, width: 2, hasFurniture: false, hasElectricity: false, furniturePrice: 120, electricityPrice: 80 },
]

export function StandPlan({ stands = mockStands, onStandSelect, readOnly = false }: StandPlanProps) {
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleStandClick = (stand: Stand) => {
    if (stand.status !== 'FREE' || readOnly) return

    setSelectedStand(stand)
    setShowModal(true)
    onStandSelect?.(stand)
  }

  const statusColors = {
    FREE: 'bg-green-500 hover:bg-green-600 cursor-pointer',
    RESERVED: 'bg-orange-500 cursor-not-allowed',
    SOLD: 'bg-red-500 cursor-not-allowed',
  }

  // Get grid dimensions
  const maxRow = Math.max(...stands.map((s) => s.row)) + 1
  const maxCol = Math.max(...stands.map((s) => s.col + (s.width || 1) - 1)) + 1

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-sm">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500" />
          <span className="text-sm">Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-sm">Vendu</span>
        </div>
      </div>

      {/* Plan Grid */}
      <div className="bg-white rounded-xl p-6 shadow-lg overflow-x-auto">
        <div
          className="grid gap-2 min-w-max mx-auto"
          style={{
            gridTemplateColumns: `repeat(${maxCol}, minmax(80px, 1fr))`,
            gridTemplateRows: `repeat(${maxRow}, 80px)`,
          }}
        >
          {stands.map((stand) => (
            <button
              key={stand.id}
              onClick={() => handleStandClick(stand)}
              disabled={stand.status !== 'FREE' || readOnly}
              className={cn(
                'rounded-lg flex flex-col items-center justify-center text-white font-semibold transition-all duration-200',
                statusColors[stand.status],
                stand.status === 'FREE' && !readOnly && 'hover:scale-105 hover:shadow-lg'
              )}
              style={{
                gridColumn: `span ${stand.width || 1}`,
                gridRow: `${stand.row + 1}`,
              }}
            >
              <span className="text-lg">{stand.code}</span>
              <span className="text-xs opacity-80">{stand.surfaceM2}m²</span>
            </button>
          ))}
        </div>

        {/* Stage */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-forest text-white rounded-lg py-4 text-center font-heading font-semibold">
            SCÈNE PRINCIPALE
          </div>
        </div>
      </div>

      {/* Selected Stand Info */}
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

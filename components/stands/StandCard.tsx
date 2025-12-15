import { Card, CardContent, Badge, Button } from '@/components/ui'
import { formatPrice, getStandStatusLabel } from '@/lib/utils'

interface Stand {
  id: string
  code: string
  surfaceM2: number
  priceHT: number
  status: 'FREE' | 'RESERVED' | 'SOLD'
  hasFurniture: boolean
  hasElectricity: boolean
}

interface StandCardProps {
  stand: Stand
  onSelect?: (stand: Stand) => void
}

export function StandCard({ stand, onSelect }: StandCardProps) {
  const statusColors = {
    FREE: 'success',
    RESERVED: 'warning',
    SOLD: 'error',
  } as const

  return (
    <Card variant="elevated" className="h-full">
      <CardContent>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-heading font-bold text-heading">
              {stand.code}
            </h3>
            <p className="text-sm text-body/60">{stand.surfaceM2} m²</p>
          </div>
          <Badge variant={statusColors[stand.status]}>
            {getStandStatusLabel(stand.status)}
          </Badge>
        </div>

        <div className="mb-4">
          <span className="text-2xl font-heading font-bold text-forest">
            {formatPrice(stand.priceHT)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-body/70 mb-4">
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 ${stand.hasFurniture ? 'text-green-500' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Mobilier {stand.hasFurniture ? 'inclus' : 'en option'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 ${stand.hasElectricity ? 'text-green-500' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Électricité {stand.hasElectricity ? 'incluse' : 'en option'}</span>
          </div>
        </div>

        {stand.status === 'FREE' && onSelect && (
          <Button onClick={() => onSelect(stand)} className="w-full">
            Réserver ce stand
          </Button>
        )}

        {stand.status === 'RESERVED' && (
          <p className="text-sm text-orange-600 text-center">
            En cours de réservation
          </p>
        )}

        {stand.status === 'SOLD' && (
          <p className="text-sm text-red-600 text-center">
            Stand déjà réservé
          </p>
        )}
      </CardContent>
    </Card>
  )
}

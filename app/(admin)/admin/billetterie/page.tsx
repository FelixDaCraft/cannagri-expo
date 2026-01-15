'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import { formatPrice, formatDate } from '@/lib/utils'

interface Ticket {
  id: string
  customerName: string
  customerEmail: string
  ticketType: 'STANDARD' | 'FLEX'
  ticketPrice: number
  status: 'PENDING' | 'PAID' | 'USED' | 'CANCELLED' | 'EXPIRED'
  qrCodeData: string
  createdAt: string
  scannedAt?: string | null
  order?: {
    orderNumber: string
    status: string
  } | null
}

const ticketTypeLabels: Record<string, string> = {
  STANDARD: 'Standard',
  FLEX: 'Flex',
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'error' }> = {
  PENDING: { label: 'En attente', variant: 'warning' },
  PAID: { label: 'Payé', variant: 'success' },
  USED: { label: 'Utilisé', variant: 'default' },
  CANCELLED: { label: 'Annulé', variant: 'error' },
}

const columns = [
  {
    key: 'customerName',
    label: 'Client',
    sortable: true,
    render: (ticket: Ticket) => (
      <div>
        <p className="font-medium">{ticket.customerName}</p>
        <p className="text-xs text-gray-500">{ticket.customerEmail}</p>
      </div>
    ),
  },
  {
    key: 'ticketType',
    label: 'Type',
    render: (ticket: Ticket) => (
      <Badge
        variant={ticket.ticketType === 'FLEX' ? 'terracotta' : 'sage'}
      >
        {ticketTypeLabels[ticket.ticketType] || ticket.ticketType}
      </Badge>
    ),
  },
  {
    key: 'ticketPrice',
    label: 'Prix',
    render: (ticket: Ticket) => formatPrice(ticket.ticketPrice),
  },
  {
    key: 'status',
    label: 'Statut',
    render: (ticket: Ticket) => {
      const config = statusConfig[ticket.status] || { label: ticket.status, variant: 'default' as const }
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    key: 'createdAt',
    label: 'Date',
    sortable: true,
    render: (ticket: Ticket) => formatDate(ticket.createdAt),
  },
]

export default function BilletteriePage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true)
        const response = await fetch('/api/tickets?limit=100')
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des billets')
        }
        const result = await response.json()
        setTickets(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  const stats = {
    total: tickets.length,
    paid: tickets.filter((t) => t.status === 'PAID').length,
    used: tickets.filter((t) => t.status === 'USED').length,
    revenue: tickets.filter((t) => t.status !== 'CANCELLED').reduce((sum, t) => sum + t.ticketPrice, 0),
  }

  const handleExport = () => {
    const csv = [
      ['Nom', 'Email', 'Type', 'Prix', 'Statut', 'QR Code', 'Date'].join(','),
      ...tickets.map((t) =>
        [
          t.customerName,
          t.customerEmail,
          ticketTypeLabels[t.ticketType] || t.ticketType,
          t.ticketPrice,
          statusConfig[t.status]?.label || t.status,
          t.qrCodeData,
          formatDate(t.createdAt),
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'billets.csv'
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des billets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">
          Billetterie
        </h1>
        <p className="text-gray-600">Gestion des billets et statistiques de vente</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="bg-white">
          <CardContent>
            <p className="text-sm text-gray-600 mb-1">Total billets</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-white">
          <CardContent>
            <p className="text-sm text-gray-600 mb-1">Billets payés</p>
            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-white">
          <CardContent>
            <p className="text-sm text-gray-600 mb-1">Billets utilisés</p>
            <p className="text-2xl font-bold text-forest">{stats.used}</p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-white">
          <CardContent>
            <p className="text-sm text-gray-600 mb-1">Chiffre d&apos;affaires</p>
            <p className="text-2xl font-bold text-forest">{formatPrice(stats.revenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <DataTable
        data={tickets}
        columns={columns}
        onExport={handleExport}
        searchPlaceholder="Rechercher par nom ou email..."
      />
    </div>
  )
}

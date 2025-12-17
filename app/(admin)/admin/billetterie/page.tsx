'use client'

import { useState } from 'react'
import { DataTable } from '@/components/admin'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import { formatPrice, formatDate } from '@/lib/utils'

// Mock data
const mockTickets = [
  {
    id: '1',
    customerName: 'Jean Dupont',
    customerEmail: 'jean@example.com',
    ticketType: 'STANDARD',
    ticketPrice: 15,
    status: 'PAID',
    qrCodeData: 'CANNAGRI-123-456',
    createdAt: '2024-12-05T10:30:00Z',
  },
  {
    id: '2',
    customerName: 'Marie Martin',
    customerEmail: 'marie@example.com',
    ticketType: 'FLEX',
    ticketPrice: 20,
    status: 'PAID',
    qrCodeData: 'CANNAGRI-789-012',
    createdAt: '2024-12-04T14:20:00Z',
  },
  {
    id: '3',
    customerName: 'Pierre Durand',
    customerEmail: 'pierre@example.com',
    ticketType: 'STANDARD',
    ticketPrice: 15,
    status: 'USED',
    qrCodeData: 'CANNAGRI-345-678',
    createdAt: '2024-12-03T09:15:00Z',
  },
]

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
    render: (ticket: typeof mockTickets[0]) => (
      <div>
        <p className="font-medium">{ticket.customerName}</p>
        <p className="text-xs text-gray-500">{ticket.customerEmail}</p>
      </div>
    ),
  },
  {
    key: 'ticketType',
    label: 'Type',
    render: (ticket: typeof mockTickets[0]) => (
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
    render: (ticket: typeof mockTickets[0]) => formatPrice(ticket.ticketPrice),
  },
  {
    key: 'status',
    label: 'Statut',
    render: (ticket: typeof mockTickets[0]) => {
      const config = statusConfig[ticket.status] || { label: ticket.status, variant: 'default' as const }
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    key: 'createdAt',
    label: 'Date',
    sortable: true,
    render: (ticket: typeof mockTickets[0]) => formatDate(ticket.createdAt),
  },
]

export default function BilletteriePage() {
  const [tickets] = useState(mockTickets)

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

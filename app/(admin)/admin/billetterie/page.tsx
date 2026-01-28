'use client'

import { useState, useEffect, useCallback } from 'react'
import { DataTable } from '@/components/admin'
import { Badge, Button, Card, CardContent, Modal, Input } from '@/components/ui'
import { formatPrice, formatDate } from '@/lib/utils'

interface Ticket {
  id: string
  customerName: string
  customerEmail: string
  ticketType: 'STANDARD' | 'FLEX'
  ticketPrice: number
  status: 'PENDING' | 'PAID' | 'USED' | 'CANCELLED' | 'EXPIRED'
  qrCodeData: string
  isComplimentary?: boolean
  invitedBy?: string | null
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

const invitationColumns = [
  {
    key: 'customerName',
    label: 'Invité',
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
      <Badge variant={ticket.ticketType === 'FLEX' ? 'terracotta' : 'sage'}>
        {ticketTypeLabels[ticket.ticketType] || ticket.ticketType}
      </Badge>
    ),
  },
  {
    key: 'status',
    label: 'Statut',
    render: (ticket: Ticket) => {
      if (ticket.scannedAt) return <Badge variant="default">Scanné</Badge>
      return <Badge variant="success">Envoyé</Badge>
    },
  },
  {
    key: 'scannedAt',
    label: 'Scanné le',
    render: (ticket: Ticket) => ticket.scannedAt ? formatDate(ticket.scannedAt) : '—',
  },
  {
    key: 'createdAt',
    label: 'Envoyé le',
    sortable: true,
    render: (ticket: Ticket) => formatDate(ticket.createdAt),
  },
]

export default function BilletteriePage() {
  const [activeTab, setActiveTab] = useState<'billets' | 'invitations'>('billets')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [invitations, setInvitations] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Invitation form
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', ticketType: 'STANDARD' })
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tickets?limit=100')
      if (!response.ok) throw new Error('Erreur lors du chargement des billets')
      const result = await response.json()
      setTickets(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchInvitations = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/invitations')
      if (!response.ok) throw new Error('Erreur lors du chargement des invitations')
      const result = await response.json()
      setInvitations(result.data || [])
    } catch (err) {
      console.error('Error fetching invitations:', err)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
    fetchInvitations()
  }, [fetchTickets, fetchInvitations])

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: inviteForm.name,
          customerEmail: inviteForm.email,
          ticketType: inviteForm.ticketType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Erreur' })
        return
      }

      setMessage({ type: 'success', text: `Invitation envoyée à ${inviteForm.email}` })
      setShowInviteForm(false)
      setInviteForm({ name: '', email: '', ticketType: 'STANDARD' })
      fetchInvitations()
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi de l\'invitation' })
    } finally {
      setSending(false)
    }
  }

  // Stats - exclude complimentary tickets from revenue
  const paidTickets = tickets.filter((t) => t.status !== 'CANCELLED' && !t.isComplimentary)
  const stats = {
    total: tickets.length,
    paid: tickets.filter((t) => t.status === 'PAID').length,
    used: tickets.filter((t) => t.status === 'USED').length,
    revenue: paidTickets.reduce((sum, t) => sum + t.ticketPrice, 0),
    invitations: invitations.length,
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

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
        <Card variant="default" className="bg-white">
          <CardContent>
            <p className="text-sm text-gray-600 mb-1">Invitations</p>
            <p className="text-2xl font-bold text-blue-600">{stats.invitations}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('billets')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'billets'
                ? 'border-forest text-forest'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Billets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'invitations'
                ? 'border-forest text-forest'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Invitations ({invitations.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'billets' ? (
        <DataTable
          data={tickets}
          columns={columns}
          onExport={handleExport}
          searchPlaceholder="Rechercher par nom ou email..."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowInviteForm(true)}>+ Nouvelle invitation</Button>
          </div>

          <DataTable
            data={invitations}
            columns={invitationColumns}
            searchPlaceholder="Rechercher un invité..."
          />
        </div>
      )}

      {/* Invitation Modal */}
      <Modal
        isOpen={showInviteForm}
        onClose={() => setShowInviteForm(false)}
        title="Envoyer une invitation gratuite"
        size="lg"
      >
        <form onSubmit={handleSendInvitation} className="space-y-4">
          <Input
            label="Nom de l'invité"
            name="name"
            value={inviteForm.name}
            onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={inviteForm.email}
            onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de billet</label>
            <select
              value={inviteForm.ticketType}
              onChange={e => setInviteForm({ ...inviteForm, ticketType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
            >
              <option value="STANDARD">Standard</option>
              <option value="FLEX">Flex</option>
            </select>
          </div>

          <p className="text-sm text-gray-500">
            Un email sera envoyé à l&apos;invité avec son billet PDF et QR code. Ce billet gratuit ne sera pas comptabilisé dans les revenus.
          </p>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowInviteForm(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" isLoading={sending} className="flex-1">
              Envoyer l&apos;invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

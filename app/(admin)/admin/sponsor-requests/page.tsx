'use client'

import { useState, useEffect } from 'react'
import { Button, Badge, Card, CardContent } from '@/components/ui'

interface SponsorRequest {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string | null
  status: 'PENDING' | 'SENT'
  sentAt: string | null
  createdAt: string
}

const statusConfig = {
  PENDING: { label: 'En attente', variant: 'warning' as const },
  SENT: { label: 'Traité', variant: 'success' as const },
}

export default function SponsorRequestsPage() {
  const [requests, setRequests] = useState<SponsorRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/sponsor-requests')
      const data = await res.json()
      if (data.data) {
        setRequests(data.data)
      }
    } catch (error) {
      console.error('Error fetching sponsor requests:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des demandes' })
    } finally {
      setLoading(false)
    }
  }

  const handleSendBrochure = async (id: string) => {
    if (!confirm('Envoyer la plaquette de sponsoring à ce contact ?')) return

    setSending(id)
    try {
      const res = await fetch(`/api/admin/sponsor-requests/${id}/send`, {
        method: 'POST',
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Plaquette envoyée avec succès' })
        fetchRequests()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'envoi' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi' })
    } finally {
      setSending(null)
    }
  }

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    sent: requests.filter((r) => r.status === 'SENT').length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">
          Demandes de Sponsoring
        </h1>
        <p className="text-gray-600">
          Gérez les demandes de plaquettes de sponsoring
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
          <button
            className="float-right font-bold"
            onClick={() => setMessage(null)}
          >
            x
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="default" className="bg-white">
          <CardContent className="text-center p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-white">
          <CardContent className="text-center p-4">
            <p className="text-sm text-gray-600">En attente</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-white">
          <CardContent className="text-center p-4">
            <p className="text-sm text-gray-600">Traités</p>
            <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500">Aucune demande de sponsoring</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className={`hover:bg-gray-50 ${
                      request.status === 'SENT' ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {request.companyName}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-gray-900">{request.contactName}</span>
                        {request.phone && (
                          <span className="block text-xs text-gray-500">
                            {request.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <a
                        href={`mailto:${request.email}`}
                        className="text-forest hover:underline"
                      >
                        {request.email}
                      </a>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={statusConfig[request.status].variant}>
                        {statusConfig[request.status].label}
                      </Badge>
                      {request.sentAt && (
                        <span className="block text-xs text-gray-400 mt-1">
                          Envoyé le {formatDate(request.sentAt)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      {request.status === 'PENDING' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSendBrochure(request.id)}
                          disabled={sending === request.id}
                        >
                          {sending === request.id ? (
                            <span className="flex items-center gap-2">
                              <svg
                                className="animate-spin h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                              Envoi...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                              </svg>
                              Envoyer plaquette
                            </span>
                          )}
                        </Button>
                      ) : (
                        <span className="text-green-600 flex items-center justify-end gap-1 text-sm">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Envoyé
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

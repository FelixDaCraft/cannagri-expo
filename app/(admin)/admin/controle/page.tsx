'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button, Card, CardContent, CardHeader, Badge } from '@/components/ui'

interface ScanResult {
  valid: boolean
  error?: string
  message?: string
  ticket?: {
    id: string
    customerName: string
    customerEmail?: string
    ticketType: string
    ticketTypeLabel: string
    orderNumber?: string
    scannedAt?: string
  }
}

interface ScanHistory {
  id: string
  timestamp: Date
  result: ScanResult
  code: string
}

interface TicketStats {
  total: number
  scanned: number
  pending: number
  byType: {
    STANDARD: { total: number; scanned: number }
    FLEX: { total: number; scanned: number }
  }
}

export default function AdminControlePage() {
  const [result, setResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [history, setHistory] = useState<ScanHistory[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Fetch ticket statistics
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/tickets/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const verifyTicket = async (qrData: string) => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData, markAsUsed: true }),
      })

      const data: ScanResult = await res.json()
      setResult(data)

      // Add to history
      setHistory(prev => [{
        id: Date.now().toString(),
        timestamp: new Date(),
        result: data,
        code: qrData.substring(0, 30) + '...'
      }, ...prev.slice(0, 49)])

      // Refresh stats after successful scan
      if (data.valid) {
        fetchStats()
      }
    } catch {
      setResult({
        valid: false,
        error: 'Erreur de connexion',
        message: 'Impossible de vérifier le billet'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      verifyTicket(manualCode.trim())
      setManualCode('')
    }
  }

  const resetResult = () => {
    setResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-forest">Contrôle des Entrées</h1>
          <p className="text-gray-600">Scanner les billets pour valider les entrées</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {!loadingStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-forest">{stats.scanned}</div>
              <div className="text-sm text-gray-500">Entrées validées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-gray-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">En attente</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-sage">{stats.byType.STANDARD.scanned}/{stats.byType.STANDARD.total}</div>
              <div className="text-sm text-gray-500">Standard</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-terracotta">{stats.byType.FLEX.scanned}/{stats.byType.FLEX.total}</div>
              <div className="text-sm text-gray-500">Flex</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="space-y-4">
          {/* Result Display */}
          {result && (
            <Card className={`border-4 ${result.valid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <CardContent className="p-6 text-center">
                {/* Icon */}
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${result.valid ? 'bg-green-500' : 'bg-red-500'}`}>
                  {result.valid ? (
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                {/* Status */}
                <h2 className={`text-2xl font-bold mb-2 ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                  {result.valid ? 'ENTRÉE AUTORISÉE' : 'ENTRÉE REFUSÉE'}
                </h2>

                {/* Error message */}
                {result.error && (
                  <p className="text-lg text-red-600 mb-2">{result.error}</p>
                )}

                {/* Ticket info */}
                {result.ticket && (
                  <div className="mt-4 p-4 bg-white rounded-lg text-left border">
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nom:</span>
                        <span className="font-bold text-gray-800">{result.ticket.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <Badge variant={result.ticket.ticketType === 'FLEX' ? 'terracotta' : 'sage'}>
                          {result.ticket.ticketTypeLabel}
                        </Badge>
                      </div>
                      {result.ticket.orderNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Commande:</span>
                          <span className="font-mono text-sm text-gray-700">{result.ticket.orderNumber}</span>
                        </div>
                      )}
                      {result.ticket.scannedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Déjà scanné:</span>
                          <span className="text-sm text-orange-600">{new Date(result.ticket.scannedAt).toLocaleString('fr-FR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Message */}
                {result.message && (
                  <p className="mt-4 text-sm text-gray-600">{result.message}</p>
                )}

                {/* Reset button */}
                <Button onClick={resetResult} className="mt-6 w-full" variant="outline">
                  Fermer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Scanner Button */}
          {!result && (
            <>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-forest/10 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold mb-2 text-gray-800">Scanner un billet</h2>
                  <p className="text-gray-500 mb-6">Ouvrir la caméra pour scanner le QR code</p>
                  <Link href="/admin/controle/scan">
                    <Button className="w-full text-lg py-6">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Démarrer le scan
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Manual input */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Saisie manuelle</h3>
                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="CANNAGRI-xxx-xxx-xxx"
                      autoComplete="off"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest/50"
                    />
                    <Button type="submit" disabled={loading || !manualCode.trim()}>
                      {loading ? '...' : 'Valider'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* History Section */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-800">Historique des scans</h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Aucun scan effectué
                </div>
              ) : (
                <div className="divide-y">
                  {history.map((item) => (
                    <div key={item.id} className="p-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.result.valid ? 'bg-green-100' : 'bg-red-100'}`}>
                        {item.result.valid ? (
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {item.result.ticket?.customerName || item.result.error || 'Inconnu'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.timestamp.toLocaleTimeString('fr-FR')}
                          {item.result.ticket?.ticketTypeLabel && (
                            <span className="ml-2">{item.result.ticket.ticketTypeLabel}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        </div>
      )}
    </div>
  )
}

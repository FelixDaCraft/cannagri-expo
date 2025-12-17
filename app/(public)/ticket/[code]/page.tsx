'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardContent } from '@/components/ui'

interface TicketInfo {
  valid: boolean
  status?: string
  error?: string
  message?: string
  ticket?: {
    id: string
    customerName: string
    ticketType: string
    ticketTypeLabel: string
    status: string
    scannedAt?: string
  }
}

export default function TicketVerificationPage() {
  const params = useParams()
  const code = params.code as string

  const [loading, setLoading] = useState(true)
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null)

  useEffect(() => {
    const verifyTicket = async () => {
      try {
        // Decode the URL-encoded code
        const decodedCode = decodeURIComponent(code)

        const res = await fetch(`/api/tickets/scan?code=${encodeURIComponent(decodedCode)}`)
        const data = await res.json()
        setTicketInfo(data)
      } catch {
        setTicketInfo({
          valid: false,
          error: 'Erreur de verification',
          message: 'Impossible de verifier ce billet'
        })
      } finally {
        setLoading(false)
      }
    }

    if (code) {
      verifyTicket()
    }
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-forest">Verification en cours...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = () => {
    if (!ticketInfo) return 'bg-gray-500'
    if (ticketInfo.ticket?.status === 'USED') return 'bg-orange-500'
    if (ticketInfo.valid) return 'bg-green-500'
    return 'bg-red-500'
  }

  const getStatusText = () => {
    if (!ticketInfo) return 'Inconnu'
    if (ticketInfo.ticket?.status === 'USED') return 'DEJA UTILISE'
    if (ticketInfo.valid) return 'BILLET VALIDE'
    return 'BILLET INVALIDE'
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="container-custom max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-heading font-bold text-forest">Verification de billet</h1>
          <p className="text-forest/60">Cann Agri Expo 2025</p>
        </div>

        <Card variant="elevated">
          <CardContent className="p-6 text-center">
            {/* Status icon */}
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${getStatusColor()}`}>
              {ticketInfo?.valid && ticketInfo?.ticket?.status !== 'USED' ? (
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : ticketInfo?.ticket?.status === 'USED' ? (
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            {/* Status text */}
            <h2 className={`text-xl font-bold mb-2 ${
              ticketInfo?.valid && ticketInfo?.ticket?.status !== 'USED' ? 'text-green-600' :
              ticketInfo?.ticket?.status === 'USED' ? 'text-orange-600' : 'text-red-600'
            }`}>
              {getStatusText()}
            </h2>

            {/* Error message */}
            {ticketInfo?.error && (
              <p className="text-red-600 mb-4">{ticketInfo.error}</p>
            )}

            {/* Ticket details */}
            {ticketInfo?.ticket && (
              <div className="mt-6 p-4 bg-forest/5 rounded-lg text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-forest/60">Titulaire</span>
                    <span className="font-bold text-forest">{ticketInfo.ticket.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60">Type de billet</span>
                    <span className={`font-bold ${
                      ticketInfo.ticket.ticketType === 'FLEX' ? 'text-terracotta' : 'text-forest'
                    }`}>
                      {ticketInfo.ticket.ticketTypeLabel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60">Statut</span>
                    <span className={`font-medium ${
                      ticketInfo.ticket.status === 'PAID' ? 'text-green-600' :
                      ticketInfo.ticket.status === 'USED' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {ticketInfo.ticket.status === 'PAID' ? 'Paye' :
                       ticketInfo.ticket.status === 'USED' ? 'Utilise' : ticketInfo.ticket.status}
                    </span>
                  </div>
                  {ticketInfo.ticket.scannedAt && (
                    <div className="flex justify-between">
                      <span className="text-forest/60">Scanne le</span>
                      <span className="text-forest text-sm">
                        {new Date(ticketInfo.ticket.scannedAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Message */}
            {ticketInfo?.message && (
              <p className="mt-4 text-sm text-forest/70">{ticketInfo.message}</p>
            )}

            {/* Info for controllers */}
            {ticketInfo?.valid && ticketInfo?.ticket?.status !== 'USED' && (
              <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                Ce billet est authentique et peut etre utilise pour entrer au salon.
              </div>
            )}

            {ticketInfo?.ticket?.status === 'USED' && (
              <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                Attention: Ce billet a deja ete scanne. Verifiez l identite du porteur.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Link to homepage */}
        <div className="text-center mt-6">
          <Link href="/">
            <Button variant="outline">Retour a l accueil</Button>
          </Link>
        </div>

        {/* Controller link */}
        <p className="text-center text-sm text-forest/50 mt-4">
          Vous etes controleur ?{' '}
          <Link href="/controle" className="text-terracotta hover:underline">
            Acceder a l interface de controle
          </Link>
        </p>
      </div>
    </div>
  )
}

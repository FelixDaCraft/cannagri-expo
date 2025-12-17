'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardContent } from '@/components/ui'

interface OrderDetails {
  id: string
  orderNumber: string
  type: string
  amount: number
  customerName: string
  customerEmail: string
}

type PaymentStatus = 'verifying' | 'success' | 'pending' | 'failed'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()

  const orderId = searchParams.get('orderId')
  const vivaOrderCode = searchParams.get('s') || searchParams.get('orderCode')
  const transactionId = searchParams.get('t')
  const isDemo = searchParams.get('demo') === 'true'

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [status, setStatus] = useState<PaymentStatus>('verifying')
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const hasVerified = useRef(false)

  const verifyPayment = useCallback(async () => {
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, vivaOrderCode, transactionId }),
      })

      const data = await res.json()

      if (data.success && data.status === 'PAID') {
        setOrder(data.order)
        setStatus('success')
      } else if (data.status === 'PENDING') {
        setStatus('pending')
      } else if (data.status === 'FAILED') {
        setStatus('failed')
        setError(data.message || 'Le paiement a echoue')
      } else if (data.error) {
        setError(data.error)
        setStatus('failed')
      }
    } catch {
      setError('Erreur lors de la verification')
      setStatus('failed')
    }
  }, [orderId, vivaOrderCode, transactionId])

  useEffect(() => {
    if (hasVerified.current) return
    if (!orderId && !vivaOrderCode) {
      setStatus('failed')
      setError('Parametres de paiement manquants')
      return
    }
    hasVerified.current = true
    verifyPayment()
  }, [orderId, vivaOrderCode, verifyPayment])

  useEffect(() => {
    if (status === 'pending' && retryCount < 5) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        verifyPayment()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status, retryCount, verifyPayment])

  if (status === 'verifying' || status === 'pending') {
    return (
      <div className="min-h-screen bg-cream py-16">
        <div className="container-custom max-w-2xl mx-auto">
          <Card variant="elevated" className="text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
              <h1 className="text-3xl font-heading font-bold text-forest mb-4">
                {status === 'verifying' ? 'Verification du paiement...' : 'Traitement en cours...'}
              </h1>
              <p className="text-forest/70 mb-4">
                {status === 'verifying' ? 'Nous verifions votre paiement.' : 'Veuillez patienter...'}
              </p>
              {status === 'pending' && retryCount > 0 && (
                <p className="text-sm text-forest/50">Tentative {retryCount}/5...</p>
              )}
              <div className="mt-8 text-sm text-forest/60">Ne fermez pas cette page</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-cream py-16">
        <div className="container-custom max-w-2xl mx-auto">
          <Card variant="elevated" className="text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-heading font-bold text-forest mb-4">Probleme de verification</h1>
              <p className="text-forest/70 mb-8">{error || 'Verification impossible.'}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => { setStatus('verifying'); setRetryCount(0); hasVerified.current = false; verifyPayment(); }}>Reessayer</Button>
                <Link href="/billetterie"><Button variant="outline">Retour a la billetterie</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="container-custom max-w-2xl mx-auto">
        <Card variant="elevated" className="text-center">
          <CardContent className="py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-heading font-bold text-forest mb-4">Paiement confirme !</h1>

            {isDemo && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 text-sm">
                Mode demonstration - Aucun paiement reel effectue
              </div>
            )}

            {order ? (
              <>
                <p className="text-forest/70 mb-8">
                  Merci pour votre {order.type === 'VISITOR_TICKET' ? 'achat de billet' : 'reservation de stand'}.
                  Vous recevrez un email de confirmation a <strong>{order.customerEmail}</strong>.
                </p>

                <div className="bg-sage/10 rounded-xl p-6 mb-8">
                  <div className="grid gap-4">
                    <div className="flex justify-between">
                      <span className="text-forest/70">N de commande</span>
                      <span className="font-bold text-forest">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forest/70">Montant</span>
                      <span className="font-bold text-forest">{order.amount.toFixed(2)} EUR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forest/70">Type</span>
                      <span className="font-medium text-forest">
                        {order.type === 'VISITOR_TICKET' ? 'Billetterie' : 'Stand exposant'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-forest/5 rounded-lg p-4 mb-8 text-left">
                  <h3 className="font-medium text-forest mb-2">Prochaines etapes :</h3>
                  {order.type === 'VISITOR_TICKET' ? (
                    <ul className="text-sm text-forest/70 space-y-1">
                      <li>Votre e-billet sera envoye par email</li>
                      <li>Presentez le QR code a l entree</li>
                      <li>Conservez votre email de confirmation</li>
                    </ul>
                  ) : (
                    <ul className="text-sm text-forest/70 space-y-1">
                      <li>Confirmation envoyee par email</li>
                      <li>Guide exposant transmis prochainement</li>
                      <li>Notre equipe vous contactera</li>
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <p className="text-forest/70 mb-8">
                Votre paiement a ete traite avec succes. Email de confirmation sous peu.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/"><Button variant="primary">Retour a l accueil</Button></Link>
              {order?.type === 'VISITOR_TICKET' && (
                <Link href="/billetterie"><Button variant="outline">Acheter d autres billets</Button></Link>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-forest/60 mt-8">
          Une question ? Contactez-nous a{' '}
          <a href="mailto:contact@cannagri-expo.fr" className="text-terracotta hover:underline">
            contact@cannagri-expo.fr
          </a>
        </p>
      </div>
    </div>
  )
}

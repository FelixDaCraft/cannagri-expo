'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button, Card, CardContent } from '@/components/ui'

// Only allow this page in demo mode
const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default function DemoPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')

  // Redirect to home if demo mode is disabled
  useEffect(() => {
    if (!DEMO_MODE_ENABLED) {
      router.replace('/')
    }
  }, [router])

  // Don't render anything if demo mode is disabled
  if (!DEMO_MODE_ENABLED) {
    return null
  }

  const [processing, setProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111')
  const [expiry, setExpiry] = useState('12/28')
  const [cvv, setCvv] = useState('123')

  const handlePayment = async (success: boolean) => {
    setProcessing(true)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (success) {
      // Call verify API to process the payment
      await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      router.push(`/paiement/succes?orderId=${orderId}&demo=true`)
    } else {
      router.push(`/paiement/echec?orderId=${orderId}&reason=declined`)
    }
  }

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Erreur: Aucune commande specifiee</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto">
        {/* Demo Warning */}
        <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg mb-4 text-sm text-center">
          MODE DEMONSTRATION - Aucun paiement reel
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-[#2E4A33] text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm opacity-80">Paiement securise</span>
                <div className="flex gap-2">
                  <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                    <span className="text-[#1a1f71] text-xs font-bold">VISA</span>
                  </div>
                  <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                    <span className="text-[#eb001b] text-xs font-bold">MC</span>
                  </div>
                </div>
              </div>
              <div className="text-3xl font-bold">
                {amount ? `${(parseInt(amount) / 100).toFixed(2)} EUR` : '-- EUR'}
              </div>
              <div className="text-sm opacity-80 mt-1">Cann Agri Expo</div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero de carte
                </label>
                <input
                  type="text"
                  autoComplete="cc-number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4A33] focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date expiration
                  </label>
                  <input
                    type="text"
                    autoComplete="cc-exp"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4A33] focus:border-transparent"
                    placeholder="MM/AA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    autoComplete="cc-csc"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4A33] focus:border-transparent"
                    placeholder="123"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <Button
                  onClick={() => handlePayment(true)}
                  disabled={processing}
                  className="w-full bg-[#2E4A33] hover:bg-[#1e3a23] text-white py-3"
                >
                  {processing ? 'Traitement...' : 'Payer maintenant'}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePayment(true)}
                    disabled={processing}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition"
                  >
                    Simuler SUCCES
                  </button>
                  <button
                    onClick={() => handlePayment(false)}
                    disabled={processing}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition"
                  >
                    Simuler ECHEC
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Paiement simule - Mode test
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Commande: {orderId}</p>
          <p className="mt-2">
            Cette page simule Viva Wallet pour les tests locaux.
          </p>
        </div>
      </div>
    </div>
  )
}

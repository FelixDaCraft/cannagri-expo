'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardContent } from '@/components/ui'

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const reason = searchParams.get('reason')

  const getErrorMessage = () => {
    switch (reason) {
      case 'cancelled':
        return 'Vous avez annulé le paiement.'
      case 'expired':
        return 'La session de paiement a expiré.'
      case 'declined':
        return 'Votre paiement a été refusé par votre banque.'
      case 'insufficient_funds':
        return 'Fonds insuffisants sur votre compte.'
      default:
        return 'Une erreur est survenue lors du traitement de votre paiement.'
    }
  }

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="container-custom max-w-2xl mx-auto">
        <Card variant="elevated" className="text-center">
          <CardContent className="py-12">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="text-3xl font-heading font-bold text-forest mb-4">
              Paiement non effectué
            </h1>

            <p className="text-forest/70 mb-8 max-w-md mx-auto">
              {getErrorMessage()}
            </p>

            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-gray-600">
                Référence de commande : <span className="font-mono">{orderId}</span>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-medium text-amber-800 mb-2">Que faire ?</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Vérifiez les informations de votre carte bancaire</li>
                <li>• Assurez-vous d&apos;avoir des fonds suffisants</li>
                <li>• Essayez avec une autre méthode de paiement</li>
                <li>• Contactez votre banque si le problème persiste</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/billetterie">
                <Button variant="primary">
                  Réessayer l&apos;achat
                </Button>
              </Link>
              <Link href="/pro/plan">
                <Button variant="outline">
                  Réserver un stand
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  Retour à l&apos;accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Contact support */}
        <div className="text-center mt-8">
          <p className="text-sm text-forest/60 mb-2">
            Besoin d&apos;aide ?
          </p>
          <a
            href="mailto:contact@cannagri-expo.fr"
            className="inline-flex items-center gap-2 text-terracotta hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            contact@cannagri-expo.fr
          </a>
        </div>
      </div>
    </div>
  )
}

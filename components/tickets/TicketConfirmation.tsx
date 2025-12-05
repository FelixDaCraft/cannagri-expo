import Link from 'next/link'
import { Button, Card, CardContent } from '@/components/ui'
import { siteConfig } from '@/config/site'

interface TicketConfirmationProps {
  orderNumber: string
  customerEmail: string
  ticketCount: number
}

export function TicketConfirmation({
  orderNumber,
  customerEmail,
  ticketCount,
}: TicketConfirmationProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-heading font-bold text-heading mb-4">
        Merci pour votre commande !
      </h1>

      <p className="text-lg text-body/70 mb-8">
        Votre réservation a bien été confirmée. Vous allez recevoir vos {ticketCount} billet(s)
        par email à l&apos;adresse <strong>{customerEmail}</strong>.
      </p>

      {/* Order Details */}
      <Card variant="bordered" className="mb-8 text-left">
        <CardContent>
          <h2 className="text-xl font-heading font-semibold mb-4">
            Détails de la commande
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-body/70">N° de commande</span>
              <span className="font-mono font-semibold">{orderNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-body/70">Nombre de billets</span>
              <span className="font-semibold">{ticketCount}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-body/70">Date de l&apos;événement</span>
              <span className="font-semibold">{siteConfig.event.date}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-body/70">Lieu</span>
              <span className="font-semibold">{siteConfig.event.location}, {siteConfig.event.city}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="bg-sage/20 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-forest flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-left">
            <h3 className="font-semibold text-heading mb-1">Important</h3>
            <p className="text-sm text-body/70">
              Présentez le QR code de votre e-billet (imprimé ou sur smartphone) à l&apos;entrée du salon.
              Chaque billet ne peut être utilisé qu&apos;une seule fois.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <Button variant="outline">
            Retour à l&apos;accueil
          </Button>
        </Link>
        <Link href="/programme">
          <Button>
            Voir le programme
          </Button>
        </Link>
      </div>
    </div>
  )
}

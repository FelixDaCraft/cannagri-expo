import { Metadata } from 'next'
import { TicketForm } from '@/components/tickets'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Billetterie',
  description: `Réservez vos billets pour ${siteConfig.name} - ${siteConfig.event.date} à ${siteConfig.event.location}, ${siteConfig.event.city}`,
}

export default function BilletteriePage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-heading mb-4">
            Billetterie
          </h1>
          <p className="text-lg text-body/70 max-w-2xl mx-auto">
            Réservez votre place pour le salon de référence du chanvre CBD.
            <br />
            <strong>{siteConfig.event.date}</strong> - {siteConfig.event.location}, {siteConfig.event.city}
          </p>
        </div>

        {/* Ticket Form */}
        <TicketForm />

        {/* Additional Info */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-sage/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-heading mb-2">E-billet par email</h3>
            <p className="text-sm text-body/70">
              Recevez instantanément votre billet avec QR code par email après paiement.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-sage/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-heading mb-2">Paiement sécurisé</h3>
            <p className="text-sm text-body/70">
              Transactions sécurisées par Viva Wallet avec protocole 3D Secure.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-sage/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-heading mb-2">Questions ?</h3>
            <p className="text-sm text-body/70">
              Contactez-nous à <a href={`mailto:${siteConfig.contact.email}`} className="text-forest hover:underline">{siteConfig.contact.email}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Metadata } from 'next'
import Link from 'next/link'
import { StandPlan } from '@/components/stands'
import { Button, Badge } from '@/components/ui'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Plan des Stands',
  description: 'Consultez le plan des stands et réservez votre emplacement au salon Cann\'Agri Expo',
}

export default function PlanPage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="sage" className="mb-4">Plan interactif</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-heading mb-4">
            Plan des Stands
          </h1>
          <p className="text-lg text-body/70 max-w-2xl mx-auto">
            Cliquez sur un stand libre (vert) pour voir les détails et procéder à la réservation.
          </p>
        </div>

        {/* Interactive Plan */}
        <div className="mb-12">
          <StandPlan stands={[]} />
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-heading mb-2">Réservation instantanée</h3>
            <p className="text-sm text-body/70">
              Choisissez votre stand et finalisez votre réservation en ligne immédiatement.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-sage/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-heading mb-2">Paiement sécurisé</h3>
            <p className="text-sm text-body/70">
              Transactions sécurisées par Viva Wallet avec facture automatique.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-sage/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-heading mb-2">Options flexibles</h3>
            <p className="text-sm text-body/70">
              Ajoutez mobilier et électricité selon vos besoins lors de la réservation.
            </p>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="bg-white rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-heading font-bold text-heading mb-6 text-center">
            Tarifs des stands
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left font-heading font-semibold text-heading">Type</th>
                  <th className="py-3 px-4 text-left font-heading font-semibold text-heading">Surface</th>
                  <th className="py-3 px-4 text-left font-heading font-semibold text-heading">Prix HT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">Stand Standard</td>
                  <td className="py-3 px-4">6-9 m²</td>
                  <td className="py-3 px-4 font-semibold text-forest">350€ - 400€</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">Stand Medium</td>
                  <td className="py-3 px-4">12-18 m²</td>
                  <td className="py-3 px-4 font-semibold text-forest">450€ - 650€</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4">Stand Premium</td>
                  <td className="py-3 px-4">24+ m²</td>
                  <td className="py-3 px-4 font-semibold text-forest">850€+</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-body/60">
            <p><strong>Options :</strong> Mobilier (+120€ HT) | Électricité (+80€ HT)</p>
            <p className="mt-1">TVA 20% applicable. Prix définitifs affichés lors de la sélection d&apos;un stand.</p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-forest rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-heading font-bold mb-4">
            Besoin d&apos;aide pour choisir ?
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Notre équipe est disponible pour vous accompagner dans le choix de votre emplacement
            et répondre à vos questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`mailto:${siteConfig.contact.email}`}>
              <Button variant="secondary">
                Nous contacter
              </Button>
            </a>
            <Link href="/pro/sponsoring">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-forest">
                Découvrir le sponsoring
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

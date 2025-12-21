import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { StandPlanWithBooking } from '@/components/stands'
import { Button, Badge } from '@/components/ui'
import { siteConfig } from '@/config/site'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Réserver un Stand',
  description: 'Réservez votre stand exposant au salon Cann\'Agri Expo - Sélectionnez votre emplacement sur le plan interactif',
}

export default async function PlanPage() {
  // Check if user is authenticated and is an approved PRO
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/connexion?callbackUrl=/pro/plan&message=' + encodeURIComponent('Connectez-vous pour accéder au plan des stands'))
  }

  // Get user details from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isApproved: true }
  })

  // Check if user is PRO
  if (!user || user.role !== 'PRO') {
    redirect('/compte?message=' + encodeURIComponent('Vous devez avoir un compte professionnel pour accéder à cette page'))
  }

  // Check if PRO is approved
  if (!user.isApproved) {
    redirect('/compte?message=' + encodeURIComponent('Votre compte professionnel est en attente de validation'))
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="forest" className="mb-4">Espace Exposant</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-heading mb-4">
            Réserver un Stand
          </h1>
          <p className="text-lg text-body/70 max-w-2xl mx-auto">
            Sélectionnez votre emplacement sur le plan. Les stands verts sont disponibles à la réservation.
          </p>
        </div>

        {/* Interactive Plan with Booking Modal */}
        <div className="mb-12">
          <StandPlanWithBooking />
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
              Transactions sécurisées par Stripe avec facture automatique.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-sage/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-heading mb-2">Tout inclus</h3>
            <p className="text-sm text-body/70">
              Mobilier (tables & chaises) et électricité inclus dans le prix du stand.
            </p>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="bg-white rounded-2xl p-8 mb-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-bold text-heading mb-2">
              Stand Exposant
            </h2>
            <p className="text-forest/70 text-lg mb-2">4 m²</p>
            <p className="text-4xl font-heading font-bold text-forest mb-6">150€</p>

            <ul className="space-y-3 text-left text-body/70 mb-6">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Mobilier inclus (tables & chaises)
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Électricité incluse
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Badge exposant
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Mention sur le site web
              </li>
            </ul>

            <p className="text-sm text-body/50 bg-cream/50 rounded-lg p-3">
              Association non soumise à la TVA - Prix net
            </p>
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
            <Link href="/sponsoring">
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

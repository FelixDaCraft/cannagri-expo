import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { siteConfig } from '@/config/site'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Espace Professionnel',
  description: 'Devenez exposant au salon Cann\'Agri Expo - Réservez votre stand',
}

const advantages = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Networking qualifié',
    description: 'Rencontrez des professionnels ciblés : producteurs, distributeurs, acheteurs B2B.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Visibilité premium',
    description: 'Exposez vos produits et services devant un public professionnel engagé.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Génération de leads',
    description: 'Captez des contacts qualifiés et développez votre réseau de distribution.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: 'Platinum CBD Cup',
    description: 'Participez au concours et gagnez en notoriété auprès de la communauté.',
  },
]

const standInfo = {
  surface: '4 m²',
  price: '150€',
  features: [
    'Emplacement sur plan',
    'Mobilier inclus (tables & chaises)',
    'Électricité incluse',
    'Badge exposant',
    'Mention sur le site web',
    'Accès à la zone exposants',
  ],
}

export default async function ProPage() {
  // Check if user is authenticated and is an approved PRO
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/connexion?callbackUrl=/pro&message=' + encodeURIComponent('Connectez-vous pour accéder à l\'espace professionnel'))
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
        <div className="text-center mb-16">
          <Badge variant="sage" className="mb-4">Espace Professionnel</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-heading mb-4">
            Devenez Exposant
          </h1>
          <p className="text-lg text-body/70 max-w-2xl mx-auto">
            Rejoignez le salon de référence du chanvre CBD et présentez vos produits
            à une audience professionnelle qualifiée.
          </p>
        </div>

        {/* Event Info */}
        <div className="bg-forest text-white rounded-2xl p-8 mb-16 text-center">
          <h2 className="text-2xl font-heading font-bold mb-4">
            {siteConfig.name} {siteConfig.event.year}
          </h2>
          <div className="flex flex-wrap justify-center gap-6 text-white/80">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {siteConfig.event.date}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {siteConfig.event.location}, {siteConfig.event.city}
            </span>
          </div>
        </div>

        {/* Advantages */}
        <section className="mb-16">
          <h2 className="text-3xl font-heading font-bold text-heading text-center mb-8">
            Pourquoi exposer ?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => (
              <Card key={index} variant="elevated" className="text-center">
                <CardContent>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage/20 flex items-center justify-center text-forest">
                    {advantage.icon}
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-heading mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-sm text-body/70">{advantage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stand Offer */}
        <section className="mb-16">
          <h2 className="text-3xl font-heading font-bold text-heading text-center mb-8">
            Notre offre d&apos;emplacement
          </h2>
          <div className="max-w-lg mx-auto">
            <Card variant="bordered" className="ring-2 ring-forest">
              <CardContent className="text-center p-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading font-semibold text-heading mb-2">
                  Stand Exposant
                </h3>
                <p className="text-forest/70 text-lg mb-2">{standInfo.surface}</p>
                <p className="text-4xl font-heading font-bold text-forest mb-6">
                  {standInfo.price}
                </p>
                <ul className="space-y-3 text-left text-body/70 mb-8">
                  {standInfo.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-body/60 bg-cream/50 rounded-lg p-4">
                  <strong>Besoin de plus d&apos;espace ?</strong><br />
                  Réservez deux stands côte à côte pour doubler votre surface (8 m² = 300€)
                </p>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-body/60 text-sm mt-6">
            Association non soumise à la TVA - Prix net, services inclus
          </p>
        </section>

        {/* CTAs */}
        <section className="bg-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-heading mb-4">
            Prêt à exposer ?
          </h2>
          <p className="text-body/70 mb-8 max-w-xl mx-auto">
            Choisissez votre emplacement sur le plan interactif et réservez votre stand
            directement en ligne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pro/plan">
              <Button size="lg">
                Réserver un stand
              </Button>
            </Link>
            <Link href="/sponsoring">
              <Button variant="outline" size="lg">
                Devenir sponsor
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

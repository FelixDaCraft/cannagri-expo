import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, Button } from '@/components/ui'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Présentation',
  description: 'Découvrez Cann\'Agri Expo, le salon de référence des professionnels du chanvre CBD en France.',
}

export default function PresentationPage() {
  return (
    <div className="min-h-screen bg-cream py-8 sm:py-12">
      <div className="container-custom">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-heading mb-4">
            Présentation de l&apos;événement
          </h1>
          <p className="text-lg sm:text-xl text-body/70 max-w-3xl mx-auto">
            Le rendez-vous incontournable des professionnels du chanvre CBD
          </p>
        </div>

        {/* About Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
          <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden bg-sage/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt={siteConfig.name}
                width={300}
                height={300}
                className="object-contain"
              />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-heading mb-6">
              Cann&apos;Agri Expo, c&apos;est quoi ?
            </h2>
            <div className="space-y-4 text-body/80">
              <p>
                <strong>Cann&apos;Agri Expo</strong> est le premier salon professionnel dédié à la filière chanvre CBD
                en région Ouest. Organisé à Nantes, cet événement rassemble producteurs, distributeurs,
                transformateurs et experts du secteur pour une journée riche en échanges et découvertes.
              </p>
              <p>
                Notre objectif est de créer un espace de rencontre privilégié entre tous les acteurs
                de la filière : agriculteurs, laboratoires, boutiques spécialisées, et porteurs de projets
                innovants dans le domaine du chanvre bien-être.
              </p>
              <p>
                L&apos;édition {siteConfig.event.year} promet d&apos;être exceptionnelle avec plus de 50 exposants,
                des conférences animées par des experts reconnus, et la prestigieuse cérémonie de la
                <strong> Platinum CBD Cup</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Key Numbers */}
        <div className="bg-forest text-white rounded-2xl p-8 sm:p-12 mb-16">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-8">
            Cann&apos;Agri Expo en chiffres
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-sage-300 mb-2">50+</div>
              <div className="text-white/80">Exposants</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-sage-300 mb-2">1000+</div>
              <div className="text-white/80">Visiteurs attendus</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-sage-300 mb-2">10+</div>
              <div className="text-white/80">Conférences</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-sage-300 mb-2">1</div>
              <div className="text-white/80">Journée exceptionnelle</div>
            </div>
          </div>
        </div>

        {/* What to expect */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-heading text-center mb-8">
            Ce qui vous attend
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="elevated">
              <CardContent>
                <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                  Espace Exposition
                </h3>
                <p className="text-body/70">
                  Découvrez les stands de nos exposants : producteurs CBD, équipements de culture,
                  produits bien-être, cosmétiques, alimentaire et plus encore.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent>
                <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                  Conférences & Tables Rondes
                </h3>
                <p className="text-body/70">
                  Assistez aux interventions d&apos;experts sur la réglementation, les tendances du marché,
                  les innovations techniques et les perspectives de la filière.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent>
                <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                  Platinum CBD Cup
                </h3>
                <p className="text-body/70">
                  La compétition qui récompense les meilleurs produits CBD de l&apos;année.
                  Un jury d&apos;experts évalue et prime les créations les plus innovantes.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent>
                <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                  Networking
                </h3>
                <p className="text-body/70">
                  Échangez avec les professionnels du secteur, développez votre réseau
                  et découvrez de nouvelles opportunités de partenariats.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent>
                <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                  Innovations
                </h3>
                <p className="text-body/70">
                  Découvrez les dernières avancées technologiques, les nouvelles variétés
                  et les innovations qui façonnent l&apos;avenir de la filière chanvre.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent>
                <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                  Documentation
                </h3>
                <p className="text-body/70">
                  Repartez avec des ressources, guides et contacts précieux
                  pour développer votre activité dans le secteur du chanvre CBD.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-heading mb-4">
            Rejoignez-nous le {siteConfig.event.date}
          </h2>
          <p className="text-body/70 max-w-2xl mx-auto mb-8">
            Ne manquez pas cette occasion unique de rencontrer les acteurs clés de la filière
            chanvre CBD et de participer à l&apos;événement de référence du secteur.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/billetterie">
              <Button size="lg">
                Réserver mon billet
              </Button>
            </Link>
            <Link href="/infos-pratiques">
              <Button variant="outline" size="lg">
                Infos pratiques
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

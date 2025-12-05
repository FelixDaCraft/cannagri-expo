import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, Badge, Button } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Exposants',
  description: 'Découvrez tous les exposants du salon Cann\'Agri Expo',
}

// Mock data for development - will be replaced with database query
const categories = [
  { slug: 'producteur', name: 'Producteurs CBD', count: 15 },
  { slug: 'materiel', name: 'Matériel de Culture', count: 8 },
  { slug: 'lifestyle', name: 'Lifestyle & Food', count: 12 },
  { slug: 'services', name: 'Services B2B', count: 6 },
]

// Placeholder exhibitors for development
const placeholderExhibitors = [
  { id: '1', name: 'CBD Farm France', category: 'Producteurs CBD', standNumber: 'A12' },
  { id: '2', name: 'GreenTech Solutions', category: 'Matériel de Culture', standNumber: 'B3' },
  { id: '3', name: 'Hemp Lifestyle', category: 'Lifestyle & Food', standNumber: 'C7' },
]

export default function ExposantsPage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-heading mb-4">
            Nos Exposants
          </h1>
          <p className="text-lg text-body/70 max-w-2xl mx-auto">
            Découvrez les acteurs de la filière chanvre CBD présents lors du salon
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Badge
            variant="forest"
            className="px-4 py-2 cursor-pointer hover:bg-forest-600 transition-colors"
          >
            Tous
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.slug}
              variant="sage"
              className="px-4 py-2 cursor-pointer hover:bg-sage-600 transition-colors"
            >
              {cat.name} ({cat.count})
            </Badge>
          ))}
        </div>

        {/* Exhibitors Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {placeholderExhibitors.map((exhibitor) => (
            <Card key={exhibitor.id} variant="elevated" className="group">
              <CardContent>
                {/* Logo Placeholder */}
                <div className="relative h-32 bg-sage/10 rounded-lg mb-4 flex items-center justify-center group-hover:bg-sage/20 transition-colors">
                  <svg className="w-12 h-12 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <Badge variant="forest" size="sm" className="absolute top-2 right-2">
                    {exhibitor.standNumber}
                  </Badge>
                </div>

                <h3 className="font-heading font-semibold text-heading mb-1">
                  {exhibitor.name}
                </h3>
                <p className="text-sm text-body/60 mb-3">{exhibitor.category}</p>

                <Link
                  href={`/exposants/${exhibitor.id}`}
                  className="text-forest text-sm font-medium hover:underline"
                >
                  Voir la fiche
                </Link>
              </CardContent>
            </Card>
          ))}

          {/* Placeholder cards */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={`placeholder-${i}`} variant="bordered" className="opacity-50">
              <CardContent>
                <div className="h-32 bg-sage/10 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-sage/50 text-sm">Bientôt</span>
                </div>
                <div className="h-4 bg-sage/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-sage/10 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-heading mb-4">
            Vous souhaitez exposer ?
          </h2>
          <p className="text-body/70 mb-6 max-w-xl mx-auto">
            Rejoignez les exposants du salon de référence du chanvre CBD.
            Réservez votre stand dès maintenant.
          </p>
          <Link href="/pro">
            <Button size="lg">
              Devenir Exposant
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

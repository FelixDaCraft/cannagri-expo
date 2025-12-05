import { Metadata } from 'next'
import Image from 'next/image'
import { Card, Badge } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Médiathèque',
  description: 'Galerie photos des éditions précédentes du salon Cann\'Agri Expo',
}

// Mock gallery data based on available images
const editions = [
  {
    year: '2024',
    photos: [
      { id: '1', src: '/images/gallery/IMG20240419105642.jpg', caption: 'Conférence' },
      { id: '2', src: '/images/gallery/IMG20240419110140.jpg', caption: 'Stands exposants' },
      { id: '3', src: '/images/gallery/IMG20240419110918.jpg', caption: 'Visiteurs' },
      { id: '4', src: '/images/gallery/IMG20240419111326.jpg', caption: 'Échanges professionnels' },
      { id: '5', src: '/images/gallery/IMG20240419111416.jpg', caption: 'Produits exposés' },
      { id: '6', src: '/images/gallery/IMG20240419111931.jpg', caption: 'Démonstration' },
      { id: '7', src: '/images/gallery/IMG20240419114423.jpg', caption: 'Remise des prix' },
      { id: '8', src: '/images/gallery/IMG20240419194621.jpg', caption: 'CBD Cup' },
    ],
  },
]

export default function MedianthequePage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-heading mb-4">
            Médiathèque
          </h1>
          <p className="text-lg text-body/70 max-w-2xl mx-auto">
            Revivez les moments forts des éditions précédentes
          </p>
        </div>

        {/* Gallery by Edition */}
        {editions.map((edition) => (
          <section key={edition.year} className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-heading font-bold text-heading">
                Édition {edition.year}
              </h2>
              <Badge variant="sage">{edition.photos.length} photos</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {edition.photos.map((photo, index) => (
                <Card
                  key={photo.id}
                  variant="default"
                  className="overflow-hidden p-0 group cursor-pointer"
                >
                  <div className="relative aspect-square bg-sage/20">
                    {/* Placeholder for actual images */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center p-4">
                        <svg className="w-12 h-12 mx-auto text-sage mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-body/50">{photo.caption}</span>
                      </div>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/60 transition-colors flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}

        {/* Info */}
        <div className="bg-white rounded-2xl p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-sage mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-xl font-heading font-semibold text-heading mb-2">
            Photos à venir
          </h3>
          <p className="text-body/70 max-w-md mx-auto">
            Les photos de l&apos;édition 2026 seront ajoutées après l&apos;événement.
            Suivez-nous sur les réseaux sociaux pour ne rien manquer !
          </p>
        </div>
      </div>
    </div>
  )
}

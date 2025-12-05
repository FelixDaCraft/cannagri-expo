'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, Badge, Modal } from '@/components/ui'

// Photos de l'édition 2024
const editions = [
  {
    year: '2024',
    description: 'Retour sur la première édition du salon professionnel CBD',
    photos: [
      { id: '1', src: '/images/gallery/IMG20240419105642.jpg', caption: 'Stand Exchange - Échanges entre professionnels' },
      { id: '2', src: '/images/gallery/IMG20240419110140.jpg', caption: 'Conférence - Vue d\'ensemble de la salle' },
      { id: '3', src: '/images/gallery/IMG20240419110918.jpg', caption: 'Conférence - Intervenants sur scène' },
      { id: '4', src: '/images/gallery/IMG20240419111326.jpg', caption: 'Table ronde - Discussion entre experts' },
      { id: '5', src: '/images/gallery/IMG20240419111416.jpg', caption: 'Networking - Échanges informels' },
      { id: '6', src: '/images/gallery/IMG20240419111931.jpg', caption: 'Remise des prix - Platinum CBD Cup' },
      { id: '7', src: '/images/gallery/IMG20240419114423.jpg', caption: 'Cérémonie - Les lauréats sur scène' },
      { id: '8', src: '/images/gallery/IMG20240419194621.jpg', caption: 'Échantillons CBD - Dégustation et évaluation' },
    ],
  },
]

export default function MedianthequePage() {
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; caption: string } | null>(null)

  return (
    <div className="min-h-screen bg-cream py-8 sm:py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-heading mb-4">
            Médiathèque
          </h1>
          <p className="text-base sm:text-lg text-body/70 max-w-2xl mx-auto px-4">
            Revivez les moments forts des éditions précédentes du salon Cann&apos;Agri Expo
          </p>
        </div>

        {/* Gallery by Edition */}
        {editions.map((edition) => (
          <section key={edition.year} className="mb-12 sm:mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-heading">
                Édition {edition.year}
              </h2>
              <Badge variant="sage">{edition.photos.length} photos</Badge>
            </div>
            <p className="text-body/70 mb-6">{edition.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
              {edition.photos.map((photo) => (
                <Card
                  key={photo.id}
                  variant="default"
                  className="overflow-hidden p-0 group cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="relative aspect-square bg-sage/20">
                    <Image
                      src={photo.src}
                      alt={photo.caption}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/40 transition-colors flex items-end">
                      <div className="w-full p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs sm:text-sm line-clamp-2">{photo.caption}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}

        {/* Info 2026 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-sage/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-heading font-semibold text-heading mb-2">
            Édition 2026 - À venir
          </h3>
          <p className="text-body/70 max-w-md mx-auto text-sm sm:text-base">
            Les photos de l&apos;édition 2026 seront ajoutées après l&apos;événement du 28 mars.
            Suivez-nous sur les réseaux sociaux pour ne rien manquer !
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title=""
      >
        {selectedPhoto && (
          <div className="space-y-4">
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.caption}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
            <p className="text-center text-body font-medium">{selectedPhoto.caption}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

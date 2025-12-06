'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { Card, Badge, Modal } from '@/components/ui'
import { Spotlight, FloatingParticles } from '@/components/ui/aceternity'

interface MediaItem {
  id: string
  src: string
  caption: string
  edition: string
  category?: string
}

// Photos statiques de l'édition 2024 (backup si pas en BDD)
const staticPhotos2024: MediaItem[] = [
  { id: 'static-1', src: '/images/gallery/IMG20240419105642.jpg', caption: 'Stand Exchange - Échanges entre professionnels', edition: '2024' },
  { id: 'static-2', src: '/images/gallery/IMG20240419110140.jpg', caption: 'Conférence - Vue d\'ensemble de la salle', edition: '2024' },
  { id: 'static-3', src: '/images/gallery/IMG20240419110918.jpg', caption: 'Conférence - Intervenants sur scène', edition: '2024' },
  { id: 'static-4', src: '/images/gallery/IMG20240419111326.jpg', caption: 'Table ronde - Discussion entre experts', edition: '2024' },
  { id: 'static-5', src: '/images/gallery/IMG20240419111416.jpg', caption: 'Networking - Échanges informels', edition: '2024' },
  { id: 'static-6', src: '/images/gallery/IMG20240419111931.jpg', caption: 'Remise des prix - Platinum CBD Cup', edition: '2024' },
  { id: 'static-7', src: '/images/gallery/IMG20240419114423.jpg', caption: 'Cérémonie - Les lauréats sur scène', edition: '2024' },
  { id: 'static-8', src: '/images/gallery/IMG20240419194621.jpg', caption: 'Échantillons CBD - Dégustation et évaluation', edition: '2024' },
]

export default function MediathequePage() {
  const [selectedPhoto, setSelectedPhoto] = useState<MediaItem | null>(null)
  const [photos, setPhotos] = useState<MediaItem[]>(staticPhotos2024)
  const [loading, setLoading] = useState(true)
  const [selectedEdition, setSelectedEdition] = useState<string>('all')

  useEffect(() => {
    // Try to fetch from API, fallback to static photos
    fetch('/api/admin/media')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Transform API data to our format
          const apiPhotos: MediaItem[] = data.map((item: { id: string; imageUrl: string; caption: string | null; edition: string; category: string | null }) => ({
            id: item.id,
            src: item.imageUrl,
            caption: item.caption || 'Photo',
            edition: item.edition,
            category: item.category || undefined,
          }))
          setPhotos(apiPhotos)
        }
        // If no data from API, keep static photos
      })
      .catch(() => {
        // Keep static photos on error
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Group photos by edition
  const photosByEdition = photos.reduce((acc, photo) => {
    if (!acc[photo.edition]) {
      acc[photo.edition] = []
    }
    acc[photo.edition].push(photo)
    return acc
  }, {} as Record<string, MediaItem[]>)

  // Sort editions by year (descending)
  const sortedEditions = Object.keys(photosByEdition).sort((a, b) => parseInt(b) - parseInt(a))

  // Filtered photos
  const displayedPhotos = selectedEdition === 'all'
    ? photos
    : photosByEdition[selectedEdition] || []

  const editionDescriptions: Record<string, string> = {
    '2024': 'Retour sur la première édition du salon professionnel CBD',
    '2025': 'Découvrez les moments forts de l\'édition 2025',
    '2026': 'Les photos de l\'édition 2026',
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-forest via-forest to-forest-600 overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60" fill="#A4B494" />
        <Spotlight className="top-10 right-0" fill="#4a6b50" />
        <FloatingParticles quantity={35} colors={['rgba(164, 180, 148, 0.5)', 'rgba(244, 241, 232, 0.3)']} />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-sage/20 backdrop-blur-sm border border-sage/30"
            >
              <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-cream mb-6">
              Galerie Photo
            </h1>
            <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto mb-6">
              Revivez les moments forts des éditions précédentes du salon Cann&apos;Agri Expo
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-3 bg-cream/10 backdrop-blur-sm rounded-full border border-cream/20"
            >
              <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-cream">{photos.length} photos</span>
              <span className="text-cream/60">•</span>
              <span className="text-cream/80">{sortedEditions.length} éditions</span>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
      </section>

      <div className="container-custom py-12">
        {/* Edition Filter - Mobile Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 -mx-4 px-4 overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-2 min-w-max pb-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedEdition('all')}
              className={`px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                selectedEdition === 'all'
                  ? 'bg-forest text-white shadow-lg shadow-forest/30'
                  : 'bg-white text-body hover:bg-sage/20 border border-sage/20'
              }`}
            >
              Toutes les éditions
              <span className="ml-1.5 opacity-70">({photos.length})</span>
            </motion.button>
            {sortedEditions.map((year) => (
              <motion.button
                key={year}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedEdition(year)}
                className={`px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  selectedEdition === year
                    ? 'bg-forest text-white shadow-lg shadow-forest/30'
                    : 'bg-white text-body hover:bg-sage/20 border border-sage/20'
                }`}
              >
                Édition {year}
                <span className="ml-1.5 opacity-70">({photosByEdition[year].length})</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-sage/20 border-t-forest rounded-full"
            />
          </div>
        ) : (
          <>
            {/* Edition Description */}
            {selectedEdition !== 'all' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <h2 className="text-2xl font-heading font-bold text-heading mb-2">
                  Édition {selectedEdition}
                </h2>
                <p className="text-body/70">
                  {editionDescriptions[selectedEdition] || `Photos de l'édition ${selectedEdition}`}
                </p>
              </motion.div>
            )}

            {/* Gallery Grid */}
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
            >
              <AnimatePresence mode="popLayout">
                {displayedPhotos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card
                      variant="default"
                      className="overflow-hidden p-0 group cursor-pointer hover:shadow-xl transition-all duration-300"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative aspect-square bg-sage/20"
                      >
                        <Image
                          src={photo.src}
                          alt={photo.caption}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white text-xs sm:text-sm line-clamp-2 font-medium">{photo.caption}</p>
                            {selectedEdition === 'all' && (
                              <Badge variant="sage" size="sm" className="mt-1">{photo.edition}</Badge>
                            )}
                          </div>
                        </div>
                        {/* Expand icon */}
                        <div className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
                          <svg className="w-4 h-4 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </motion.div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Info 2026 - only show if no 2026 photos */}
            {!photosByEdition['2026'] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12 bg-gradient-to-r from-sage/20 to-forest/10 rounded-2xl p-6 sm:p-8 text-center border border-sage/20"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                  Édition 2026 - À venir
                </h3>
                <p className="text-body/70 max-w-md mx-auto">
                  Les photos de l&apos;édition 2026 seront ajoutées après l&apos;événement du 28 mars.
                  Suivez-nous sur les réseaux sociaux pour ne rien manquer !
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title=""
      >
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-4"
          >
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.caption}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-body font-medium">{selectedPhoto.caption}</p>
              <Badge variant="forest">{selectedPhoto.edition}</Badge>
            </div>
          </motion.div>
        )}
      </Modal>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Badge } from '@/components/ui'
import { Spotlight, FloatingParticles } from '@/components/ui/aceternity'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

interface GalleryImage {
  id: string
  src: string
  caption: string
  edition: string
  width?: number
  height?: number
}

// Photos de l'édition 2024
const photos2024: GalleryImage[] = [
  { id: '1', src: '/images/gallery/2024_1766113359810_oljax3.jpg', caption: 'Salon Cann\'Agri Expo 2024', edition: '2024', width: 1920, height: 1080 },
  { id: '2', src: '/images/gallery/2024_1766113363622_fdd64p.jpg', caption: 'Échanges entre professionnels', edition: '2024', width: 1920, height: 1080 },
  { id: '3', src: '/images/gallery/2024_1766113365274_ohh5kc.jpg', caption: 'Conférences et tables rondes', edition: '2024', width: 1920, height: 1080 },
  { id: '4', src: '/images/gallery/2024_1766113376843_b3wkv2.jpg', caption: 'Networking et découvertes', edition: '2024', width: 1920, height: 1080 },
]

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryImage[]>(photos2024)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [selectedEdition, setSelectedEdition] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger les photos depuis l'API publique
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const apiPhotos: GalleryImage[] = data.map((item: { id: string; imageUrl: string; caption: string | null; edition: string }) => ({
            id: item.id,
            src: item.imageUrl,
            caption: item.caption || 'Photo',
            edition: item.edition,
            width: 1920,
            height: 1080,
          }))
          setPhotos(apiPhotos)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Grouper par édition
  const photosByEdition = photos.reduce((acc, photo) => {
    if (!acc[photo.edition]) acc[photo.edition] = []
    acc[photo.edition].push(photo)
    return acc
  }, {} as Record<string, GalleryImage[]>)

  const sortedEditions = Object.keys(photosByEdition).sort((a, b) => parseInt(b) - parseInt(a))

  // Photos filtrées
  const displayedPhotos = selectedEdition === 'all'
    ? photos
    : photosByEdition[selectedEdition] || []

  // Slides pour Lightbox
  const slides = displayedPhotos.map(photo => ({
    src: photo.src,
    alt: photo.caption,
    title: photo.caption,
  }))

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
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
            <div className="inline-flex items-center gap-2 px-5 py-3 bg-cream/10 backdrop-blur-sm rounded-full border border-cream/20">
              <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-cream">{photos.length} photos</span>
              <span className="text-cream/60">•</span>
              <span className="text-cream/80">{sortedEditions.length} édition{sortedEditions.length > 1 ? 's' : ''}</span>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
      </section>

      <div className="container-custom py-12">
        {/* Filtres par édition */}
        <div className="mb-8 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            <button
              onClick={() => setSelectedEdition('all')}
              className={`px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                selectedEdition === 'all'
                  ? 'bg-forest text-white shadow-lg'
                  : 'bg-white text-body hover:bg-sage/20 border border-sage/20'
              }`}
            >
              Toutes les éditions ({photos.length})
            </button>
            {sortedEditions.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedEdition(year)}
                className={`px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  selectedEdition === year
                    ? 'bg-forest text-white shadow-lg'
                    : 'bg-white text-body hover:bg-sage/20 border border-sage/20'
                }`}
              >
                Édition {year} ({photosByEdition[year].length})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-12 h-12 border-4 border-sage/20 border-t-forest rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Description de l'édition */}
            {selectedEdition !== 'all' && (
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-bold text-heading mb-2">
                  Édition {selectedEdition}
                </h2>
                <p className="text-body/70">
                  {selectedEdition === '2024'
                    ? 'Retour sur la première édition du salon professionnel CBD'
                    : `Photos de l'édition ${selectedEdition}`}
                </p>
              </div>
            )}

            {/* Grille de photos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {displayedPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="group cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-sage/20 shadow-md hover:shadow-xl transition-all duration-300">
                    <Image
                      src={photo.src}
                      alt={photo.caption}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {/* Overlay au hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-sm line-clamp-2 font-medium">{photo.caption}</p>
                        {selectedEdition === 'all' && (
                          <Badge variant="sage" size="sm" className="mt-1">{photo.edition}</Badge>
                        )}
                      </div>
                    </div>
                    {/* Icône zoom */}
                    <div className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
                      <svg className="w-4 h-4 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Info édition 2026 */}
            {!photosByEdition['2026'] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12 bg-gradient-to-r from-sage/20 to-forest/10 rounded-2xl p-6 sm:p-8 text-center border border-sage/20"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                  Édition 2026 - À venir
                </h3>
                <p className="text-body/70 max-w-md mx-auto">
                  Les photos de l&apos;édition 2026 seront ajoutées après l&apos;événement du 28 mars.
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
        }}
        controller={{ closeOnBackdropClick: true }}
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

export interface GalleryPhoto {
  id: string
  src: string
  thumb: string | null
  alt: string
  caption: string | null
}

/**
 * Grille de photos : chaque miniature est un bouton « Agrandir la photo » atteignable
 * au clavier (constat n°58), la visionneuse garde le focus et se ferme avec Échap.
 */
export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const t = useTranslations('gallery')
  const [index, setIndex] = useState(-1)

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t('enlarge', { alt: photo.alt })}
              className="group block w-full overflow-hidden rounded-xl bg-forest/10 text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumb ?? photo.src}
                alt=""
                width={640}
                height={640}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
              />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        open={index >= 0}
        index={Math.max(index, 0)}
        close={() => setIndex(-1)}
        slides={photos.map((photo) => ({ src: photo.src, alt: photo.alt, title: photo.caption ?? undefined }))}
        labels={{
          Previous: t('previous'),
          Next: t('next'),
          Close: t('close'),
          Lightbox: t('viewer'),
          Carousel: t('viewer'),
          'Photo gallery': t('viewer'),
          Slide: t('photo'),
          '{index} of {total}': t('position', { index: '{index}', total: '{total}' }),
        }}
        styles={{ container: { backgroundColor: 'rgba(13, 20, 27, 0.95)' } }}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  )
}

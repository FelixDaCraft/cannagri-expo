'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'
import type { PreviewPhoto } from '@/lib/home/gallery-preview'

export interface GalleryPreviewPhoto extends PreviewPhoto {
  year: number
}

// Grande photo à gauche, quatre petites à droite (deux sur mobile)
const layout = ['col-span-2 row-span-2', '', '', '', '']

/** Aperçu de la galerie : cinq photos variées et un lien vers la médiathèque */
export function GalleryPreview({ photos }: { photos: GalleryPreviewPhoto[] }) {
  const t = useTranslations('home.gallery')
  if (photos.length === 0) return null

  const years = Array.from(new Set(photos.map((p) => p.year)))
  const title = years.length === 1 ? t('titleYear', { year: years[0] }) : t('title')

  return (
    <section className="bg-forest py-[4.5rem] text-cream md:py-28" aria-labelledby="galerie-title">
      <div className="container-custom">
        <Reveal className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:gap-8">
          <h2 id="galerie-title" className="font-display text-[3.75rem] font-normal leading-[.85] text-cream md:text-[5.5rem]">
            {title}
          </h2>
          <Link href="/mediatheque" className="link-underline text-cream decoration-cream/40">
            {t('viewAll')}
          </Link>
        </Reveal>

        <ul className="mt-10 grid auto-rows-[160px] grid-cols-2 gap-3 md:mt-14 md:auto-rows-[200px] md:grid-cols-4">
          {photos.map((photo, i) => (
            <Reveal
              as="li"
              key={photo.id}
              delay={i * 70}
              className={cn('relative overflow-hidden rounded-xl bg-forest-400', layout[i], i >= 3 && 'hidden md:block')}
            >
              <figure className="h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={640}
                  className="h-full w-full object-cover"
                />
                {photo.caption && (
                  <figcaption className="absolute bottom-3 left-3 right-3 w-fit rounded-md bg-forest px-2.5 py-1.5 font-condensed text-[0.9375rem] font-medium leading-tight text-cream">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

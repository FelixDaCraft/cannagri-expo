'use client'

import { useTranslations } from 'next-intl'
import { Reveal } from '@/components/ui/Reveal'
import { useEdition } from '@/components/editions'
import { optimizedPoster } from '@/lib/home/format'

const ITEMS = ['producers', 'shops', 'growing', 'fertilizers', 'smoking', 'talks', 'tattoo', 'food'] as const

/** « Au menu de la fête » : la liste de l'affiche, mot pour mot, et l'affiche elle-même */
export function MenuSection() {
  const t = useTranslations('home.menu')
  const edition = useEdition()
  const poster = optimizedPoster(edition.posterUrl)

  return (
    <section className="bg-forest py-[4.5rem] text-cream md:py-28" aria-labelledby="menu-title">
      <div className="container-custom grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <Reveal>
            <h2 id="menu-title" className="font-display text-[3.75rem] font-normal leading-[.85] text-cream md:text-[5.5rem] text-balance">
              {t('title')}
            </h2>
          </Reveal>
          <ul className="mt-8 gap-x-8 sm:columns-2 md:mt-10">
            {ITEMS.map((item, i) => (
              <Reveal
                as="li"
                key={item}
                delay={i * 40}
                className="break-inside-avoid border-b border-cream/15 py-3 font-condensed text-[1.625rem] font-semibold leading-tight md:text-[1.875rem]"
              >
                {t(`items.${item}`)}
              </Reveal>
            ))}
          </ul>
          <Reveal>
            <p className="mt-8 max-w-[22em] font-accent text-[1.75rem] leading-snug text-mint md:text-[1.875rem]">{t('cup')}</p>
          </Reveal>
        </div>

        {poster && (
          <Reveal className="justify-self-center lg:justify-self-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster.src}
              srcSet={poster.srcSet}
              sizes="(min-width: 1024px) 440px, 300px"
              width={poster.width ?? 880}
              height={poster.height ?? 1237}
              loading="lazy"
              decoding="async"
              alt={t('posterAlt', { year: edition.year })}
              className="h-auto w-[300px] rotate-2 rounded-md shadow-[0_24px_48px_rgba(0,0,0,.35)] lg:w-[440px]"
            />
          </Reveal>
        )}
      </div>
    </section>
  )
}

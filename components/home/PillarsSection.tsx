'use client'

import { useTranslations } from 'next-intl'
import { OFFICIAL_FIGURES } from '@/config/figures'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'

// Photos de l'édition 2024 ; la première occupe la grande case
const PILLARS = [
  { key: 'producers', image: '/images/piliers/producteurs.jpg', width: 800, height: 500 },
  { key: 'growing', image: '/images/piliers/materiel.jpg', width: 800, height: 500 },
  { key: 'talks', image: '/images/piliers/conferences.jpg', width: 800, height: 400 },
  { key: 'lifestyle', image: '/images/piliers/lifestyle.jpg', width: 800, height: 400 },
] as const

// Chiffres officiels de la dernière édition (config/figures.ts)
const STATS = OFFICIAL_FIGURES

const tileLayout = [
  'col-span-2 h-60 md:col-span-1 md:row-span-2 md:h-auto',
  'h-44 md:h-auto',
  'h-44 md:h-auto',
  'col-span-2 h-44 md:h-auto',
]

/** « Toute la filière sous un toit » : une grande photo, trois petites, puis les chiffres */
export function PillarsSection() {
  const t = useTranslations('home.pillars')

  return (
    <section className="bg-cream py-[4.5rem] text-forest md:py-24" aria-labelledby="piliers-title">
      <div className="container-custom">
        <Reveal>
          <h2 id="piliers-title" className="font-display text-[3.75rem] font-normal leading-[.85] text-forest md:text-[5.5rem] text-balance">
            {t('title')}
          </h2>
          <p className="mt-5 max-w-[34em] text-[1.1875rem] leading-relaxed text-ink">{t('subtitle')}</p>
        </Reveal>

        <ul className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-[1.4fr_1fr_1fr] md:grid-rows-[280px_280px] md:gap-4">
          {PILLARS.map((pillar, i) => (
            <Reveal as="li" key={pillar.key} delay={i * 80} className={cn('relative overflow-hidden rounded-2xl bg-cream-300', tileLayout[i])}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pillar.image}
                alt={t(`items.${pillar.key}.alt`)}
                width={pillar.width}
                height={pillar.height}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-2 bottom-2 rounded-[10px] bg-cream px-3 py-2 md:inset-x-4 md:bottom-4 md:px-4 md:py-3">
                <h3 className="font-condensed text-xl font-semibold leading-tight text-forest md:text-2xl">
                  {t(`items.${pillar.key}.title`)}
                </h3>
                <p className="hidden text-[0.9375rem] leading-snug text-ink md:block">{t(`items.${pillar.key}.description`)}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        {/* Les chiffres : une colonne sur mobile pour ne rien couper (constat n°38) */}
        <Reveal>
          <p className="mt-14 font-condensed text-lg font-semibold text-gold-ink md:mt-16">{t('statsCaption')}</p>
          <dl className="mt-3 grid border-t border-forest/15 sm:grid-cols-3">
            {STATS.map((stat, i) => (
              <div
                key={stat.key}
                className={cn(
                  'flex flex-row-reverse items-baseline justify-end gap-4 border-b border-forest/15 py-4 sm:flex-col-reverse sm:items-start sm:justify-start sm:gap-1 sm:border-b-0 sm:py-6',
                  i > 0 && 'sm:border-l sm:pl-8'
                )}
              >
                <dt className="font-condensed text-xl font-semibold text-ink">{t(`stats.${stat.key}`)}</dt>
                <dd className="font-display text-[3.5rem] leading-[.9] text-forest md:text-[4.5rem]">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}

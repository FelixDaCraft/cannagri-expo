'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { useEdition } from '@/components/editions'
import { shortHoursRange } from '@/lib/home/format'
import { CountdownTimer } from './CountdownTimer'

/**
 * Hero de l'accueil : la mascotte entière (pieds visibles) sur bleu nuit, le titre en Modak,
 * l'annotation « fête ses 5 ans » en Chewy et les infos de l'affiche en Barlow Condensed.
 * Pas d'animation d'entrée : le titre, la date et le bouton s'affichent tout de suite.
 */
export function HeroSection() {
  const t = useTranslations('home.hero')
  const edition = useEdition()
  const hours = shortHoursRange(edition.hoursLabel)

  const facts = [
    { label: t('when'), value: edition.dateLabel ? t('dateValue', { date: edition.dateLabel }) : edition.dateDisplay },
    ...(hours ? [{ label: t('hours'), value: hours }] : []),
    { label: t('where'), value: edition.venueDisplay },
  ]

  const mascot = (className: string, sizes: string) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/hero-personnage-800.webp"
      srcSet="/images/hero-personnage-480.webp 480w, /images/hero-personnage-800.webp 800w, /images/hero-personnage-1100.webp 1100w"
      sizes={sizes}
      width={1400}
      height={2021}
      alt={t('mascotAlt')}
      fetchPriority="high"
      decoding="async"
      className={className}
    />
  )

  return (
    <section className="screen-hero relative flex flex-col justify-center overflow-hidden bg-forest text-cream" aria-labelledby="hero-title">
      <div className="container-custom relative w-full">
        <div className="relative z-10 py-6 sm:py-10 lg:max-w-[34rem] lg:py-8 xl:max-w-[44rem]">
          <h1
            id="hero-title"
            className="font-display text-[clamp(3.5rem,min(17vw,8.5svh),9rem)] font-normal leading-[.82] text-cream lg:text-[min(7.5rem,13svh)] xl:text-[min(9rem,13svh)]"
          >
            <span className="block">Cann&apos;Agri</span>
            <span className="block">Expo</span>
          </h1>
          <p className="mt-2 inline-block origin-left -rotate-3 font-accent text-[2rem] leading-tight text-mint sm:text-[3rem] lg:text-[min(3rem,5.5svh)]">
            {t('anniversary')}
          </p>

          {/* Mobile : les infos à gauche, la mascotte entière à droite, pour tout garder dans le premier écran */}
          <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-3 sm:mt-7 lg:block">
            <dl className="w-full border-y border-cream/15 font-condensed sm:flex sm:w-max">
              {facts.map((fact, i) => (
                <div
                  key={fact.label}
                  className={
                    'border-cream/15 py-2 sm:py-3 lg:py-[min(1rem,1.6svh)] ' +
                    (i === 0 ? 'sm:pr-7 lg:pr-5 xl:pr-7' : 'border-t sm:border-l sm:border-t-0 sm:px-7 lg:px-5 xl:px-7')
                  }
                >
                  <dt className="text-[0.9375rem] font-medium leading-tight text-cream/70">{fact.label}</dt>
                  <dd className="text-[1.375rem] font-semibold leading-tight text-cream sm:text-[1.875rem] lg:text-[1.5rem] xl:text-[1.875rem]">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className="w-[clamp(7.5rem,36vw,11rem)] sm:w-[12rem] lg:hidden">
              {mascot('block h-auto w-full', '(min-width: 640px) 192px, 36vw')}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2 sm:mt-7 lg:mt-[min(2.25rem,4svh)]">
            <ButtonLink href="/billetterie" size="lg" className="w-full sm:w-auto">
              {t('buyTicket')}
            </ButtonLink>
            <Link href="/infos-pratiques" className="link-underline text-cream decoration-cream/40">
              {t('practicalInfo')}
            </Link>
          </div>

          <div className="mt-5 sm:mt-7 lg:mt-[min(2.25rem,4svh)]">
            <CountdownTimer />
          </div>
          <p className="mt-4 hidden font-condensed text-lg font-medium text-cream/70 sm:block">{t('tagline')}</p>
        </div>

        {/* Grand écran : la mascotte entière à droite, à la hauteur du premier écran */}
        <div className="pointer-events-none absolute bottom-0 right-4 hidden lg:block xl:right-10">
          {mascot(
            'block h-[min(calc(100svh-72px-2.5rem),820px,calc((100vw-34rem-7rem)*1.44))] w-auto xl:h-[min(calc(100svh-72px-2.5rem),860px,calc((100vw-44rem-8rem)*1.44))]',
            '(min-width: 1024px) 40vw, 1px'
          )}
        </div>
      </div>
    </section>
  )
}

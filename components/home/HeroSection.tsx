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

  return (
    <section className="relative overflow-hidden bg-forest text-cream" aria-labelledby="hero-title">
      <div className="container-custom relative lg:flex lg:min-h-[min(calc(100vh-72px),860px)] lg:items-center">
        <div className="relative z-10 pb-10 pt-8 sm:pt-12 lg:max-w-[36rem] lg:py-20 xl:max-w-[46rem]">
          <h1
            id="hero-title"
            className="font-display text-[clamp(4rem,19vw,9rem)] font-normal lg:text-[7.5rem] xl:text-[9rem] leading-[.82] text-cream"
          >
            <span className="block">Cann&apos;Agri</span>
            <span className="block">Expo</span>
          </h1>
          <p className="mt-3 inline-block origin-left -rotate-3 font-accent text-[2.25rem] leading-tight text-mint sm:text-[3.25rem]">
            {t('anniversary')}
          </p>

          <dl className="mt-7 grid w-full grid-cols-2 border-y border-cream/15 font-condensed sm:mt-9 sm:flex sm:w-max">
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className={
                  i === 0
                    ? 'col-span-2 border-b border-cream/15 py-3 sm:border-b-0 sm:py-4 sm:pr-7 lg:pr-5 xl:pr-7'
                    : 'border-cream/15 py-3 pr-4 sm:border-l sm:py-4 sm:pl-7 sm:pr-7 lg:px-5 xl:px-7 [&:nth-child(3)]:border-l [&:nth-child(3)]:pl-4 sm:[&:nth-child(3)]:pl-7 lg:[&:nth-child(3)]:pl-5 xl:[&:nth-child(3)]:pl-7'
                }
              >
                <dt className="text-[0.9375rem] font-medium leading-tight text-cream/70">{fact.label}</dt>
                <dd className="text-[1.625rem] font-semibold leading-tight text-cream sm:text-[1.875rem] lg:text-[1.5rem] xl:text-[1.875rem]">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 sm:mt-9">
            <ButtonLink href="/billetterie" size="lg" className="w-full sm:w-auto">
              {t('buyTicket')}
            </ButtonLink>
            <Link href="/infos-pratiques" className="link-underline text-cream decoration-cream/40">
              {t('practicalInfo')}
            </Link>
          </div>

          <div className="mt-9">
            <CountdownTimer />
          </div>
          <p className="mt-6 font-condensed text-lg font-medium text-cream/70">{t('tagline')}</p>
        </div>

        {/* La mascotte, entière : sous le texte sur mobile, à droite sur grand écran */}
        <div className="relative z-0 mx-auto -mt-2 w-[min(78%,20rem)] sm:w-[22rem] lg:absolute lg:bottom-0 lg:right-4 lg:mt-0 lg:w-auto xl:right-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-personnage-800.webp"
            srcSet="/images/hero-personnage-480.webp 480w, /images/hero-personnage-800.webp 800w, /images/hero-personnage-1100.webp 1100w"
            sizes="(min-width: 1024px) 34vw, (min-width: 640px) 352px, 78vw"
            width={1400}
            height={2021}
            alt={t('mascotAlt')}
            fetchPriority="high"
            decoding="async"
            className="block h-auto w-full lg:h-[520px] lg:w-auto xl:h-[min(calc(100vh-120px),800px)] xl:min-h-[600px]"
          />
        </div>
      </div>
    </section>
  )
}

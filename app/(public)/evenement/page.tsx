import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { getActiveEditionView } from '@/lib/editions'
import { formatEditionDate } from '@/lib/editions/format'
import { optimizedPoster } from '@/lib/home/format'
import { OFFICIAL_FIGURES } from '@/config/figures'
import { PageHeader } from '@/components/ui/PageHeader'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/ui/Reveal'

const FEATURES = ['exhibition', 'conferences', 'cup', 'networking', 'innovations', 'documentation'] as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('event')
  return { title: t('metaTitle'), description: t('lead') }
}

export default async function PresentationPage() {
  const [t, locale, edition] = await Promise.all([getTranslations('event'), getLocale(), getActiveEditionView()])
  const poster = optimizedPoster(edition.posterUrl)
  const date = formatEditionDate(edition.startAt, locale) ?? t('dateTba')

  return (
    <>
      <PageHeader eyebrow={`Cann'Agri Expo ${edition.year}`} title={t('title')} lead={t('lead')} />

      {/* Le salon en quelques lignes, à côté de l'affiche */}
      <section className="bg-cream py-16 text-forest md:py-24" aria-labelledby="about-title">
        <div className="container-custom grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <Reveal>
            <h2 id="about-title" className="title-display">{t('about.title')}</h2>
            <p className="mt-3 font-accent text-[1.75rem] leading-snug text-gold-ink">{t('about.annotation')}</p>
            <div className="mt-6 max-w-[34em] space-y-4 text-lg leading-relaxed text-ink">
              <p>{t('about.p1')}</p>
              <p>{t('about.p2')}</p>
              <p>{t('about.p3', { date, venue: edition.venueDisplay })}</p>
            </div>
          </Reveal>
          {poster && (
            <Reveal delay={100} className="justify-self-center lg:justify-self-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poster.src}
                srcSet={poster.srcSet}
                sizes="(min-width: 1024px) 400px, 280px"
                width={poster.width ?? 880}
                height={poster.height ?? 1237}
                loading="lazy"
                decoding="async"
                alt={t('posterAlt', { year: edition.year })}
                className="h-auto w-[280px] rotate-2 rounded-md shadow-[0_24px_48px_rgba(29,43,58,.28)] lg:w-[400px]"
              />
            </Reveal>
          )}
        </div>
      </section>

      {/* Chiffres officiels (les mêmes que sur l'accueil) */}
      <section className="border-t border-forest/10 bg-cream pb-16 text-forest md:pb-24" aria-labelledby="stats-title">
        <div className="container-custom pt-12 md:pt-16">
          <h2 id="stats-title" className="font-condensed text-lg font-semibold text-gold-ink">{t('stats.title')}</h2>
          <dl className="mt-6 grid gap-8 sm:grid-cols-3">
            {OFFICIAL_FIGURES.map((figure, i) => (
              <Reveal key={figure.key} delay={i * 80} className="border-forest/15 sm:border-l sm:pl-6 sm:first:border-l-0 sm:first:pl-0">
                <dt className="sr-only">{t(`stats.${figure.key}`)}</dt>
                <dd className="font-display text-[4rem] font-normal leading-none text-forest md:text-[5rem]">{figure.value}</dd>
                <dd aria-hidden="true" className="mt-2 font-condensed text-xl font-semibold">{t(`stats.${figure.key}`)}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Ce qui vous attend */}
      <section className="bg-forest py-16 text-cream md:py-24" aria-labelledby="features-title">
        <div className="container-custom">
          <Reveal>
            <h2 id="features-title" className="title-display text-cream">{t('features.title')}</h2>
          </Reveal>
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {FEATURES.map((key, i) => (
              <Reveal as="li" key={key} delay={(i % 2) * 80} className="border-b border-cream/15 py-6">
                <h3 className="font-condensed text-[1.625rem] font-semibold leading-tight text-cream">{t(`features.${key}.title`)}</h3>
                <p className="mt-2 max-w-[34em] text-[1.0625rem] leading-relaxed text-cream/80">{t(`features.${key}.description`)}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Appel à l'action, sur fond crème comme la dernière section de l'accueil */}
      <section className="bg-cream text-forest" aria-labelledby="cta-title">
        <Reveal className="container-custom flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:gap-10 md:py-16">
          <div>
            <h2 id="cta-title" className="title-display">{t('cta.title', { date })}</h2>
            <p className="mt-3 max-w-[32em] text-lg leading-relaxed text-ink">{t('cta.description')}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <ButtonLink href="/billetterie" size="lg">{t('cta.bookTicket')}</ButtonLink>
            <ButtonLink href="/infos-pratiques" size="lg" tone="outline-night">{t('cta.practicalInfo')}</ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  )
}

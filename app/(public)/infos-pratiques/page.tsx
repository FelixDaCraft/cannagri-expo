import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { getActiveEditionView } from '@/lib/editions'
import { formatEditionDate, formatEditionHours, formatVenueAddress } from '@/lib/editions/format'
import { formatTicketPrice } from '@/lib/editions/tickets'
import { shortHoursRange } from '@/lib/home/format'
import { siteConfig } from '@/config/site'
import { PageHeader } from '@/components/ui/PageHeader'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/ui/Reveal'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('practicalInfo')
  return { title: t('metaTitle'), description: t('subtitle') }
}

/** Un bloc d'infos toujours ouvert (constat n°13 : plus d'accordéon fermé) */
function InfoBlock({ id, title, children, delay = 0 }: { id: string; title: string; children: ReactNode; delay?: number }) {
  return (
    <Reveal as="section" delay={delay} aria-labelledby={id} className="border-t-2 border-forest pt-5">
      <h2 id={id} className="font-condensed text-[1.75rem] font-semibold leading-tight text-forest">{title}</h2>
      <div className="mt-3 space-y-3 text-[1.0625rem] leading-relaxed text-ink">{children}</div>
    </Reveal>
  )
}

export default async function InfosPratiquesPage() {
  const [t, locale, edition] = await Promise.all([getTranslations('practicalInfo'), getLocale(), getActiveEditionView()])

  const date = formatEditionDate(edition.startAt, locale)
  const hours = shortHoursRange(formatEditionHours(edition.startAt, edition.endAt))
  const address = formatVenueAddress(edition.address, edition.city)
  const destination = [edition.venueName, address].filter(Boolean).join(', ')
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
  const social = [
    { label: 'Instagram', href: siteConfig.social.instagram },
    { label: 'Facebook', href: siteConfig.social.facebook },
    { label: 'LinkedIn', href: siteConfig.social.linkedin },
  ]

  return (
    <>
      <PageHeader eyebrow={`Cann'Agri Expo ${edition.year}`} title={t('title')} lead={t('subtitle')}>
        <dl className="grid gap-x-10 gap-y-4 font-condensed sm:flex sm:flex-wrap">
          {[
            { label: t('when'), value: date ?? t('tba') },
            { label: t('hours'), value: hours ?? t('tba') },
            { label: t('where'), value: edition.venueDisplay },
          ].map((item) => (
            <div key={item.label} className="sm:border-l sm:border-cream/20 sm:pl-6 sm:first:border-l-0 sm:first:pl-0">
              <dt className="text-base font-medium text-cream/70">{item.label}</dt>
              <dd className="text-[1.625rem] font-semibold leading-tight text-cream">{item.value}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      <div className="bg-cream py-14 text-forest md:py-20">
        <div className="container-custom grid gap-x-16 gap-y-12 lg:grid-cols-2">
          <InfoBlock id="horaires" title={t('blocks.hoursPrices.title')}>
            <p>
              {date && hours ? t('blocks.hoursPrices.schedule', { date, hours }) : t('blocks.hoursPrices.scheduleTba')}
            </p>
            <ul className="divide-y divide-forest/15 border-y border-forest/15 font-condensed text-xl">
              <li className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="font-semibold text-forest">{t('blocks.hoursPrices.standard')}</span>
                <span className="font-semibold text-forest">{formatTicketPrice(edition.standardTicketPrice)}</span>
              </li>
              <li className="flex items-baseline justify-between gap-4 py-2.5">
                <span>
                  <span className="font-semibold text-forest">{t('blocks.hoursPrices.flex')}</span>{' '}
                  <span className="font-body text-base text-ink">
                    {t('blocks.hoursPrices.flexNote', { amount: formatTicketPrice(edition.flexTicketPrice - edition.standardTicketPrice) })}
                  </span>
                </span>
                <span className="font-semibold text-forest">{formatTicketPrice(edition.flexTicketPrice)}</span>
              </li>
            </ul>
            {edition.ticketInfo && <p className="whitespace-pre-line">{edition.ticketInfo}</p>}
            <p>{t('blocks.hoursPrices.terms')}</p>
            <ButtonLink href="/billetterie" className="mt-2">{t('tickets.buyButton')}</ButtonLink>
          </InfoBlock>

          <InfoBlock id="acces" title={t('blocks.access.title')} delay={80}>
            <p>
              <span className="font-semibold text-forest">{edition.venueName}</span>
              {address && <><br />{address}</>}
            </p>
            {edition.accessTransport && <p className="whitespace-pre-line">{edition.accessTransport}</p>}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-forest decoration-forest/40"
            >
              {t('blocks.access.directions')}
              <span className="sr-only"> {t('newTab')}</span>
            </a>
          </InfoBlock>

          <Reveal className="lg:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/lieu-agronaute-1200.webp"
              srcSet="/images/lieu-agronaute-640.webp 640w, /images/lieu-agronaute-1200.webp 1200w"
              sizes="(min-width: 1280px) 1216px, 100vw"
              width={1200}
              height={675}
              loading="lazy"
              decoding="async"
              alt={t('venuePhotoAlt')}
              className="aspect-[16/7] h-auto w-full rounded-2xl object-cover"
            />
          </Reveal>

          <InfoBlock id="parking" title={t('blocks.parking.title')}>
            <p className="whitespace-pre-line">{edition.accessParking || t('blocks.parking.tba')}</p>
          </InfoBlock>

          <InfoBlock id="sur-place" title={t('blocks.onSite.title')} delay={80}>
            <ul className="list-disc space-y-1 pl-5 marker:text-gold-ink">
              <li>{t('blocks.onSite.stands')}</li>
              <li>{t('blocks.onSite.talks')}</li>
              <li>{t('blocks.onSite.food')}</li>
              <li>{t('blocks.onSite.cup')}</li>
            </ul>
          </InfoBlock>

          <InfoBlock id="accessibilite" title={t('blocks.accessibility.title')}>
            <p>{edition.accessInfo || t('blocks.accessibility.tba')}</p>
            <p>{t('blocks.accessibility.contact')}</p>
          </InfoBlock>

          <InfoBlock id="contact" title={t('contact.title')} delay={80}>
            <p>
              <a href={`mailto:${siteConfig.contact.email}`} className="link-underline text-forest decoration-forest/40">
                {siteConfig.contact.email}
              </a>
              <br />
              <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`} className="link-underline text-forest decoration-forest/40">
                {siteConfig.contact.phone}
              </a>
            </p>
            <p>
              <span className="font-semibold text-forest">{t('social.title')} :</span>{' '}
              {social.map((item, i) => (
                <span key={item.label}>
                  {i > 0 && ' · '}
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="link-underline text-forest decoration-forest/40">
                    {item.label}
                    <span className="sr-only"> {t('newTab')}</span>
                  </a>
                </span>
              ))}
            </p>
          </InfoBlock>
        </div>
      </div>

      {/* Professionnels : la plaquette avant tout compte (constat n°56) */}
      <section className="border-t border-forest/10 bg-cream text-forest" aria-labelledby="pro-title">
        <Reveal className="container-custom flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:gap-10 md:py-16">
          <div>
            <h2 id="pro-title" className="title-display">{t('professional.title')}</h2>
            <p className="mt-3 max-w-[32em] text-lg leading-relaxed text-ink">{t('professional.description')}</p>
          </div>
          <ButtonLink href="/sponsoring" size="lg" className="shrink-0">{t('professional.button')}</ButtonLink>
        </Reveal>
      </section>
    </>
  )
}

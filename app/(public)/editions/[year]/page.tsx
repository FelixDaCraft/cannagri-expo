import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { editionService, formatEditionDate, formatEventTime } from '@/lib/editions'
import { getEditionEvents, getEditionMedia, getEditionSponsors } from '@/lib/editions/content'
import { getEditionExhibitors } from '@/lib/editions/exhibitors'
import { hostedLogo } from '@/lib/editions/logo'
import { optimizedPoster } from '@/lib/home/format'
import { getTranslatedText } from '@/lib/translation'
import { toGalleryPhoto } from '@/lib/gallery-photos'
import { PageHeader } from '@/components/ui/PageHeader'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/ui/Reveal'
import { ExhibitorList } from '@/components/editions/ExhibitorList'
import { PhotoGallery } from '@/components/gallery/PhotoGallery'

interface PageProps {
  params: { year: string }
}

const getArchivedEdition = cache(async (yearParam: string) => {
  const year = Number(yearParam)
  if (!Number.isInteger(year)) return null
  return editionService.getPublicByYear(year)
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [t, edition] = await Promise.all([getTranslations('editions'), getArchivedEdition(params.year)])
  if (!edition) return { title: t('notFound') }
  return { title: t('edition', { year: edition.year }), description: t('metaDescription', { year: edition.year }) }
}

export default async function EditionArchivePage({ params }: PageProps) {
  const edition = await getArchivedEdition(params.year)
  if (!edition) notFound()
  // L'édition en cours est présentée par le site lui-même
  if (edition.status === 'ACTIVE') redirect('/')

  const [t, tg, locale, events, sponsors, exhibitors, media] = await Promise.all([
    getTranslations('editions'),
    getTranslations('gallery'),
    getLocale(),
    getEditionEvents(edition.id),
    getEditionSponsors(edition.id),
    getEditionExhibitors(edition.id),
    getEditionMedia(edition.id),
  ])

  const dateLabel = formatEditionDate(edition.startAt, locale)
  const place = [edition.venueName, edition.city].filter(Boolean).join(', ')
  const poster = optimizedPoster(edition.posterUrl)
  const sectionTitle = 'title-display mb-8'

  return (
    <>
      <PageHeader
        eyebrow={t('archived')}
        title={`Cann'Agri Expo ${edition.year}`}
        lead={[dateLabel, place].filter(Boolean).join(' · ') || undefined}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/">{t('nextEdition')}</ButtonLink>
          <ButtonLink href="/editions" tone="outline-cream">{t('allEditions')}</ButtonLink>
        </div>
      </PageHeader>

      <div className="bg-cream py-14 text-forest md:py-20">
        <div className="container-custom space-y-20">
          {(poster || edition.archiveSummary) && (
            <Reveal className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <h2 className="title-display">{t('recapTitle', { year: edition.year })}</h2>
                <p className="mt-5 max-w-[36em] whitespace-pre-line text-lg leading-relaxed text-ink">
                  {edition.archiveSummary || t('recap', { date: dateLabel ?? String(edition.year), place: place || '—', stands: exhibitors.length, events: events.length })}
                </p>
              </div>
              {poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={poster.src}
                  srcSet={poster.srcSet}
                  sizes="320px"
                  width={poster.width ?? 880}
                  height={poster.height ?? 1245}
                  loading="lazy"
                  decoding="async"
                  alt={t('posterAlt', { year: edition.year })}
                  className="h-auto w-[280px] rotate-2 justify-self-center rounded-md shadow-[0_24px_48px_rgba(29,43,58,.28)] md:w-[320px]"
                />
              )}
            </Reveal>
          )}

          {events.length > 0 && (
            <section aria-labelledby="conferences">
              <h2 id="conferences" className={sectionTitle}>{t('program')}</h2>
              <ol className="rounded-2xl border-2 border-forest p-6 md:p-8">
                {events.map((event) => {
                  const speakers = event.speakers.length
                    ? event.speakers.map((s) => [s.name, s.company].filter(Boolean).join(' – '))
                    : event.speakerName
                      ? [[event.speakerName, event.speakerCompany].filter(Boolean).join(' – ')]
                      : []
                  return (
                    <li key={event.id} className="grid gap-1 border-b border-forest/15 py-4 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[9rem_1fr] sm:gap-6">
                      <span className="font-condensed text-xl font-semibold tabular-nums text-gold-ink">
                        {formatEventTime(event.startAt)} – {formatEventTime(event.endAt)}
                      </span>
                      <div>
                        <p className="font-condensed text-xl font-semibold leading-tight">
                          {getTranslatedText(event.title, event.titleTranslations, locale)}
                        </p>
                        {speakers.length > 0 && <p className="mt-1 text-base text-ink">{speakers.join(', ')}</p>}
                        {event.location && <p className="mt-1 text-base text-ink">{event.location}</p>}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
          )}

          {exhibitors.length > 0 && (
            <section aria-labelledby="stands">
              <h2 id="stands" className={sectionTitle}>{t('stands', { count: exhibitors.length })}</h2>
              <ExhibitorList exhibitors={exhibitors} locale={locale} />
            </section>
          )}

          {sponsors.length > 0 && (
            <section aria-labelledby="sponsors">
              <h2 id="sponsors" className={sectionTitle}>{t('sponsors')}</h2>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {sponsors.map((sponsor) => {
                  const logo = hostedLogo(sponsor.logoUrl)
                  const content = (
                    <>
                      <span className="flex h-20 w-full items-center justify-center rounded-lg bg-white p-2">
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logo} alt="" width={160} height={64} loading="lazy" decoding="async" className="max-h-full w-full object-contain" />
                        ) : (
                          <span aria-hidden="true" className="font-display text-3xl text-forest">{sponsor.name.charAt(0).toUpperCase()}</span>
                        )}
                      </span>
                      <span className="font-condensed text-lg font-semibold leading-tight">{sponsor.name}</span>
                    </>
                  )
                  return (
                    <li key={sponsor.id}>
                      {sponsor.websiteUrl ? (
                        <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col items-center gap-2 rounded-2xl border border-forest/15 bg-cream-100 p-3 text-center text-forest hover:border-forest">
                          {content}
                          <span className="sr-only">{t('newTab')}</span>
                        </a>
                      ) : (
                        <div className="flex h-full flex-col items-center gap-2 rounded-2xl border border-forest/15 bg-cream-100 p-3 text-center text-forest">{content}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {media.length > 0 && (
            <section aria-labelledby="photos">
              <h2 id="photos" className={sectionTitle}>{t('photos')}</h2>
              <PhotoGallery photos={media.map((row) => toGalleryPhoto(row, tg('fallbackAlt', { year: edition.year })))} />
            </section>
          )}

          {events.length + sponsors.length + exhibitors.length + media.length === 0 && (
            <p className="text-lg text-ink">{t('noContent')}</p>
          )}
        </div>
      </div>
    </>
  )
}

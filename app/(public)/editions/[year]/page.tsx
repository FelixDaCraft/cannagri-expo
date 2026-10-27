import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'
import { editionService, formatEditionDate, formatEventTime } from '@/lib/editions'
import { getEditionEvents, getEditionMedia, getEditionSponsors } from '@/lib/editions/content'
import { getEditionExhibitors } from '@/lib/editions/exhibitors'

interface PageProps {
  params: { year: string }
}

const getArchivedEdition = cache(async (yearParam: string) => {
  const year = Number(yearParam)
  if (!Number.isInteger(year)) return null
  return editionService.getPublicByYear(year)
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const edition = await getArchivedEdition(params.year)
  if (!edition) return { title: 'Édition introuvable' }
  return {
    title: `Édition ${edition.year}`,
    description: `Revivez Cann'Agri Expo ${edition.year} : programme, partenaires, exposants et photos.`,
  }
}

export default async function EditionArchivePage({ params }: PageProps) {
  const edition = await getArchivedEdition(params.year)
  if (!edition) notFound()
  // L'édition en cours est présentée par le site lui-même
  if (edition.status === 'ACTIVE') redirect('/')

  const [events, sponsors, exhibitors, media] = await Promise.all([
    getEditionEvents(edition.id),
    getEditionSponsors(edition.id),
    getEditionExhibitors(edition.id),
    getEditionMedia(edition.id),
  ])

  const dateLabel = formatEditionDate(edition.startAt)
  const place = [edition.venueName, edition.city].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-cream">
      {/* En-tête */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-forest via-forest to-forest-600">
        <div className="container-custom flex flex-col md:flex-row items-center gap-10">
          {edition.posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={edition.posterUrl}
              alt={`Affiche Cann'Agri Expo ${edition.year}`}
              className="w-full max-w-xs rounded-2xl border-4 border-cream/30 shadow-2xl"
            />
          )}
          <div className="text-center md:text-left">
            <span className="inline-block rounded-full bg-cream/10 px-4 py-1 text-sm font-semibold text-sage border border-cream/20">
              Édition archivée
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-heading font-bold text-cream">
              Cann&apos;Agri Expo {edition.year}
            </h1>
            {(dateLabel || place) && (
              <p className="mt-3 text-lg text-cream/80">{[dateLabel, place].filter(Boolean).join(' · ')}</p>
            )}
            {edition.archiveSummary && (
              <p className="mt-6 max-w-2xl text-cream/90 whitespace-pre-line">{edition.archiveSummary}</p>
            )}
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
              <Link href="/" className="rounded-lg bg-terracotta px-5 py-3 font-semibold text-cream hover:opacity-90">
                Découvrir la prochaine édition
              </Link>
              <Link href="/editions" className="rounded-lg border border-cream/30 px-5 py-3 font-semibold text-cream hover:bg-cream/10">
                Toutes les éditions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-12 space-y-16">
        {/* Stands présents */}
        {exhibitors.length > 0 && (
          <section aria-labelledby="stands">
            <h2 id="stands" className="text-3xl font-heading font-bold text-heading mb-6">
              Stands présents <span className="text-body/50 text-xl">({exhibitors.length})</span>
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exhibitors.map((exhibitor) => (
                <li key={`${exhibitor.standNumber}-${exhibitor.id}`} className="flex gap-4 rounded-xl border border-sage/20 bg-white p-4">
                  {exhibitor.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={exhibitor.logoUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-contain" />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-sage/15 font-heading font-bold text-forest">
                      {exhibitor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">Stand {exhibitor.standNumber}</p>
                    {exhibitor.websiteUrl ? (
                      <a href={exhibitor.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest hover:underline">
                        {exhibitor.name}
                      </a>
                    ) : (
                      <p className="font-semibold text-heading">{exhibitor.name}</p>
                    )}
                    <p className="text-xs text-body/60">{exhibitor.categoryLabel}</p>
                    {exhibitor.description && <p className="mt-1 text-sm text-body/70 line-clamp-2">{exhibitor.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Conférences */}
        {events.length > 0 && (
          <section aria-labelledby="conferences">
            <h2 id="conferences" className="text-3xl font-heading font-bold text-heading mb-6">Conférences et programme</h2>
            <ol className="divide-y divide-sage/20 rounded-2xl border border-sage/20 bg-white">
              {events.map((event) => {
                const speakers = event.speakers.length
                  ? event.speakers.map((s) => [s.name, s.company].filter(Boolean).join(' – '))
                  : event.speakerName
                    ? [[event.speakerName, event.speakerCompany].filter(Boolean).join(' – ')]
                    : []
                return (
                  <li key={event.id} className="flex flex-col sm:flex-row gap-2 sm:gap-6 p-4">
                    <span className="shrink-0 font-semibold text-forest tabular-nums sm:w-32">
                      {formatEventTime(event.startAt)} – {formatEventTime(event.endAt)}
                    </span>
                    <div>
                      <p className="font-semibold text-heading">{event.title}</p>
                      {speakers.length > 0 && <p className="text-sm text-body/70">{speakers.join(', ')}</p>}
                      {event.location && <p className="text-xs text-body/50 mt-1">{event.location}</p>}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        {/* Sponsors */}
        {sponsors.length > 0 && (
          <section aria-labelledby="sponsors">
            <h2 id="sponsors" className="text-3xl font-heading font-bold text-heading mb-6">Sponsors et partenaires</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sponsors.map((sponsor) => (
                <li key={sponsor.id} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-sage/20 bg-white p-4 text-center">
                  {sponsor.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sponsor.logoUrl} alt="" className="h-16 w-full object-contain" />
                  )}
                  {sponsor.websiteUrl ? (
                    <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-forest hover:underline">
                      {sponsor.name}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-heading">{sponsor.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Photos */}
        {media.length > 0 && (
          <section aria-labelledby="photos">
            <h2 id="photos" className="text-3xl font-heading font-bold text-heading mb-6">Photos</h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {media.map((photo) => (
                <li key={photo.id}>
                  <a href={photo.imageUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.imageUrl}
                      alt={photo.altText || photo.caption || `Cann'Agri Expo ${edition.year}`}
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform hover:scale-105"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {events.length + sponsors.length + exhibitors.length + media.length === 0 && (
          <p className="text-center text-body/70">Les contenus de cette édition ne sont pas disponibles.</p>
        )}
      </div>
    </div>
  )
}

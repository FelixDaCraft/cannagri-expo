import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { editionService, getActiveEditionView } from '@/lib/editions'
import { formatEditionDate, formatEventTime } from '@/lib/editions/format'
import { getEditionEvents } from '@/lib/editions/content'
import { shortHour } from '@/lib/home/format'
import { getTranslatedText } from '@/lib/translation'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'

export const dynamic = 'force-dynamic'

const EVENT_TYPES = ['CONFERENCE', 'WORKSHOP', 'CEREMONY', 'BREAK', 'NETWORKING']

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('programme')
  return { title: t('metaTitle'), description: t('subtitle') }
}

async function getEvents(editionId: string) {
  try {
    return await getEditionEvents(editionId)
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export default async function ProgrammePage() {
  const [t, th, locale, edition] = await Promise.all([
    getTranslations('programme'),
    getTranslations('home.program'),
    getLocale(),
    getActiveEditionView(),
  ])
  const events = await getEvents(edition.id)
  // Programme vide : on renvoie vers la dernière édition qui en avait un (constat n°20)
  const previous = events.length === 0 ? (await editionService.listPublishedArchives())[0] ?? null : null
  const date = formatEditionDate(edition.startAt, locale)

  const knownDay = [
    { when: edition.startAt ? shortHour(formatEventTime(edition.startAt)) : th('morning'), title: th('rows.opening.title'), detail: th('rows.opening.detail') },
    { when: th('allDay'), title: th('rows.talks.title'), detail: th('rows.talks.detail') },
    { when: th('endOfDay'), title: th('rows.cup.title'), detail: th('rows.cup.detail') },
    { when: edition.endAt ? shortHour(formatEventTime(edition.endAt)) : th('evening'), title: th('rows.closing.title') },
  ]

  return (
    <>
      <PageHeader
        eyebrow={`Cann'Agri Expo ${edition.year}`}
        title={t('title')}
        lead={[date, edition.venueDisplay].filter(Boolean).join(' · ')}
      />

      <div className="bg-cream py-14 text-forest md:py-20">
        <div className="container-custom">
          {events.length > 0 ? (
            <>
              <ol className="mx-auto max-w-4xl rounded-2xl border-2 border-forest p-6 md:p-8">
                {events.map((event) => {
                  const type = EVENT_TYPES.includes(event.type) ? event.type : null
                  const speakers = event.speakers.length
                    ? event.speakers.map((s) => [s.name, s.company || s.title].filter(Boolean).join(' – '))
                    : event.speakerName
                      ? [[event.speakerName, event.speakerCompany].filter(Boolean).join(' – ')]
                      : []
                  return (
                    <Reveal as="li" key={event.id} className="grid gap-1 border-b border-forest/15 py-5 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[9rem_1fr] sm:gap-6">
                      <span className="font-condensed text-xl font-semibold tabular-nums text-gold-ink">
                        {formatEventTime(event.startAt)} – {formatEventTime(event.endAt)}
                      </span>
                      <div>
                        <p className="font-condensed text-base font-semibold text-ink">
                          {type && t(`types.${type}`)}
                          {(event.isPlatinumCBDCup || event.isHighlighted) && <> · {t(event.isPlatinumCBDCup ? 'badges.highlighted' : 'badges.mustSee')}</>}
                        </p>
                        <h2 className="font-condensed text-[1.375rem] font-semibold leading-tight">
                          {getTranslatedText(event.title, event.titleTranslations, locale)}
                        </h2>
                        {event.description && (
                          <p className="mt-1 text-base leading-relaxed text-ink">{getTranslatedText(event.description, event.descriptionTranslations, locale)}</p>
                        )}
                        {speakers.length > 0 && <p className="mt-1 text-base text-ink">{speakers.join(', ')}</p>}
                        {event.location && <p className="mt-1 text-base text-ink">{event.location}</p>}
                      </div>
                    </Reveal>
                  )
                })}
              </ol>
              <p className="mx-auto mt-6 max-w-4xl text-base text-ink">{t('footer.disclaimer')}</p>
            </>
          ) : (
            <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <h2 className="title-display">{t('emptyState.title')}</h2>
                <p className="mt-5 max-w-[30em] text-lg leading-relaxed text-ink">{t('emptyState.description', { year: edition.year })}</p>
                {previous && (
                  <Link href={`/editions/${previous.year}`} className="link-underline mt-4 text-forest decoration-forest/40">
                    {t('emptyState.previous', { year: previous.year })}
                  </Link>
                )}
              </Reveal>
              <Reveal delay={100} className="rounded-2xl border-2 border-forest p-6 md:p-8">
                <h3 className="sr-only">{t('emptyState.knownTitle')}</h3>
                <ol>
                  {knownDay.map((row) => (
                    <li key={row.title} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-forest/15 py-4 font-condensed first:pt-0 last:border-b-0 md:grid-cols-[7.5rem_1fr]">
                      <span className="text-[1.375rem] font-semibold leading-tight text-gold-ink">{row.when}</span>
                      <span className="text-[1.375rem] font-semibold leading-tight">
                        {row.title}
                        {row.detail && <span className="mt-1 block font-body text-base font-normal leading-snug text-ink">{row.detail}</span>}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-[0.9375rem] text-ink">{th('note')}</p>
              </Reveal>
            </div>
          )}
        </div>
      </div>

      {/* Restez informé : le formulaire d'inscription arrive avec la newsletter */}
      <section id="restez-informe" className="border-t border-forest/10 bg-cream text-forest" aria-labelledby="news-title">
        <Reveal className="container-custom py-14 md:py-16">
          <h2 id="news-title" className="title-display">{t('stayInformed.title')}</h2>
          <p className="mt-3 max-w-[34em] text-lg leading-relaxed text-ink">{t('stayInformed.text')}</p>
        </Reveal>
      </section>
    </>
  )
}

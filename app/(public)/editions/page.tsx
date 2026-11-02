import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { editionService, formatEditionDate } from '@/lib/editions'
import { optimizedPoster } from '@/lib/home/format'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('editions')
  return { title: t('metaTitle'), description: t('subtitle') }
}

export default async function EditionsArchivePage() {
  const [t, locale, editions] = await Promise.all([getTranslations('editions'), getLocale(), editionService.listPublishedArchives()])

  return (
    <>
      <PageHeader title={t('title')} lead={t('subtitle')} />

      <div className="bg-cream py-14 text-forest md:py-20">
        <div className="container-custom">
          {editions.length === 0 ? (
            <p className="text-lg text-ink">{t('empty')}</p>
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {editions.map((edition, i) => {
                const poster = optimizedPoster(edition.posterUrl)
                const details = [formatEditionDate(edition.startAt, locale), [edition.venueName, edition.city].filter(Boolean).join(', ')]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <Reveal as="li" key={edition.id} delay={i * 80}>
                    <Link href={`/editions/${edition.year}`} className="group block rounded-2xl border-2 border-forest bg-cream-100 p-4">
                      {poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={poster.src}
                          srcSet={poster.srcSet}
                          sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                          width={poster.width ?? 880}
                          height={poster.height ?? 1245}
                          loading="lazy"
                          decoding="async"
                          alt=""
                          className="aspect-[3/4] w-full rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg bg-forest">
                          <span className="font-display text-7xl text-cream">{edition.year}</span>
                        </div>
                      )}
                      <h2 className="mt-4 font-display text-[2.5rem] font-normal leading-none text-forest">{t('edition', { year: edition.year })}</h2>
                      {details && <p className="mt-2 font-condensed text-lg font-semibold text-ink">{details}</p>}
                      <span className="link-underline text-forest decoration-forest/40 group-hover:decoration-mint">{t('see')}</span>
                    </Link>
                  </Reveal>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

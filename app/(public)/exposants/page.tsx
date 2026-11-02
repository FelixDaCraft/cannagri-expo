import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { editionService, getActiveEditionView } from '@/lib/editions'
import { getEditionExhibitors } from '@/lib/editions/exhibitors'
import { PageHeader } from '@/components/ui/PageHeader'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/ui/Reveal'
import { ExhibitorList } from '@/components/editions/ExhibitorList'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('exhibitors')
  return { title: t('metaTitle'), description: t('subtitle') }
}

/** Dernière édition archivée qui avait des stands : sert d'aperçu tant que la liste de l'année est vide */
async function getPreviousExhibitors() {
  for (const archive of await editionService.listPublishedArchives()) {
    const exhibitors = await getEditionExhibitors(archive.id)
    if (exhibitors.length > 0) return { year: archive.year, exhibitors }
  }
  return null
}

export default async function ExposantsPage() {
  const [t, locale, edition] = await Promise.all([getTranslations('exhibitors'), getLocale(), getActiveEditionView()])
  const exhibitors = await getEditionExhibitors(edition.id)
  const previous = exhibitors.length === 0 ? await getPreviousExhibitors() : null

  return (
    <>
      <PageHeader
        eyebrow={`Cann'Agri Expo ${edition.year}`}
        title={t('title')}
        lead={exhibitors.length > 0 ? t('confirmedCount', { count: exhibitors.length }) : t('comingSoonLead', { year: edition.year })}
      />

      <div className="bg-cream py-14 text-forest md:py-20">
        <div className="container-custom">
          {exhibitors.length > 0 ? (
            <ExhibitorList exhibitors={exhibitors} locale={locale} headingLevel="h2" />
          ) : previous ? (
            <>
              <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="title-display">{t('previous.title', { year: previous.year })}</h2>
                  <p className="mt-3 max-w-[36em] text-lg leading-relaxed text-ink">
                    {t('previous.text', { count: previous.exhibitors.length, year: previous.year })}
                  </p>
                </div>
                <Link href={`/editions/${previous.year}`} className="link-underline shrink-0 text-forest decoration-forest/40">
                  {t('previous.link', { year: previous.year })}
                </Link>
              </Reveal>
              <ExhibitorList exhibitors={previous.exhibitors} locale={locale} />
            </>
          ) : (
            <p className="text-lg text-ink">{t('noExhibitors')}</p>
          )}
        </div>
      </div>

      {/* Exposer : la plaquette avant tout compte (constat n°56) */}
      <section className="border-t border-forest/10 bg-cream text-forest" aria-labelledby="cta-title">
        <Reveal className="container-custom flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:gap-10 md:py-16">
          <div>
            <h2 id="cta-title" className="title-display">{t('cta.title')}</h2>
            <p className="mt-3 max-w-[32em] text-lg leading-relaxed text-ink">{t('cta.description', { year: edition.year })}</p>
          </div>
          <ButtonLink href="/sponsoring" size="lg" className="shrink-0">{t('cta.button')}</ButtonLink>
        </Reveal>
      </section>
    </>
  )
}

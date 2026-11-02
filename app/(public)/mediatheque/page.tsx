import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getActiveEditionView } from '@/lib/editions'
import { getPublishedPhotosByYear, toGalleryPhoto } from '@/lib/gallery-photos'
import { PageHeader } from '@/components/ui/PageHeader'
import { PhotoGallery } from '@/components/gallery/PhotoGallery'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('gallery')
  return { title: t('metaTitle'), description: t('subtitle') }
}

export default async function GalleryPage() {
  const [t, edition, years] = await Promise.all([getTranslations('gallery'), getActiveEditionView(), getPublishedPhotosByYear()])
  const total = years.reduce((sum, y) => sum + y.rows.length, 0)

  return (
    <>
      <PageHeader title={t('title')} lead={t('subtitle')}>
        {total > 0 && <p className="font-condensed text-xl font-semibold text-cream/80">{t('count', { count: total })}</p>}
      </PageHeader>

      <div className="bg-cream py-14 text-forest md:py-20">
        <div className="container-custom space-y-14">
          {years.map(({ year, rows }) => (
            <section key={year} aria-labelledby={`photos-${year}`}>
              <h2 id={`photos-${year}`} className="title-display mb-8">{t('yearTitle', { year })}</h2>
              <PhotoGallery photos={rows.map((row) => toGalleryPhoto(row, t('fallbackAlt', { year })))} />
            </section>
          ))}

          {years.length === 0 && <p className="text-lg text-ink">{t('empty')}</p>}

          {!years.some((y) => y.year === edition.year) && (
            <p className="border-t-2 border-forest pt-5 text-lg text-ink">
              {t('upcoming', { year: edition.year })}
            </p>
          )}
        </div>
      </div>
    </>
  )
}

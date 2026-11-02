import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getActiveEdition } from '@/lib/editions'
import { hostedLogo } from '@/lib/editions/logo'
import { getTranslatedText, type Translations } from '@/lib/translation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ButtonLink } from '@/components/ui/ButtonLink'

interface PageProps {
  params: { slug: string }
}

const getSponsor = cache(async (slug: string) => {
  try {
    const edition = await getActiveEdition()
    return await prisma.sponsor.findFirst({
      where: { editionId: edition.id, slug, isActive: true },
      include: { stand: true },
    })
  } catch (error) {
    console.error('Error fetching sponsor:', error)
    return null
  }
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [t, locale, sponsor] = await Promise.all([getTranslations('sponsorPage'), getLocale(), getSponsor(params.slug)])
  if (!sponsor) return { title: t('notFound') }
  return {
    title: sponsor.name,
    description:
      getTranslatedText(sponsor.description, sponsor.descriptionTranslations as Translations | null, locale) ||
      t('metaDescription', { name: sponsor.name }),
  }
}

export default async function SponsorPage({ params }: PageProps) {
  const sponsor = await getSponsor(params.slug)
  if (!sponsor) notFound()

  const [t, locale] = await Promise.all([getTranslations('sponsorPage'), getLocale()])
  const description = getTranslatedText(sponsor.description, sponsor.descriptionTranslations as Translations | null, locale)
  const articleTitle = getTranslatedText(sponsor.articleTitle, sponsor.articleTitleTranslations as Translations | null, locale)
  const articleBody = getTranslatedText(sponsor.articleBody, sponsor.articleBodyTranslations as Translations | null, locale)
  const isPlatine = sponsor.type === 'PLATINE'
  const logo = hostedLogo(sponsor.logoUrl)
  const host = (() => {
    if (!sponsor.websiteUrl) return null
    try {
      return new URL(sponsor.websiteUrl).hostname
    } catch {
      return sponsor.websiteUrl
    }
  })()

  return (
    <>
      <PageHeader
        eyebrow={[isPlatine ? t('platineSponsor') : t('partner'), sponsor.stand ? `${t('stand')} ${sponsor.stand.number}` : null].filter(Boolean).join(' · ')}
        title={sponsor.name}
        lead={description || undefined}
      >
        {sponsor.websiteUrl && (
          <ButtonLink href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer">
            {t('visitWebsite')}
            <span className="sr-only"> {t('newTab')}</span>
          </ButtonLink>
        )}
      </PageHeader>

      <div className="bg-cream py-14 text-forest md:py-20">
        <div className="container-custom grid items-start gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {isPlatine && articleTitle ? (
              <article>
                {sponsor.articleImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sponsor.articleImage} alt="" loading="lazy" decoding="async" className="mb-8 aspect-[16/9] w-full rounded-2xl object-cover" />
                )}
                <h2 className="title-display">{articleTitle}</h2>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink [&_a]:text-forest [&_a]:underline" dangerouslySetInnerHTML={{ __html: articleBody }} />
              </article>
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-2xl border border-forest/15 bg-white p-6">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={t('logoAlt', { name: sponsor.name })} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span aria-hidden="true" className="font-display text-7xl text-forest">{sponsor.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            )}
          </div>

          <aside className="border-t-2 border-forest pt-5" aria-labelledby="find-us">
            <h2 id="find-us" className="font-condensed text-[1.75rem] font-semibold leading-tight">{t('findUsAtEvent')}</h2>
            <dl className="mt-3 space-y-3 text-[1.0625rem] text-ink">
              {sponsor.stand && (
                <div>
                  <dt className="font-condensed text-lg font-semibold text-forest">{t('stand')}</dt>
                  <dd>{sponsor.stand.number}</dd>
                </div>
              )}
              {sponsor.websiteUrl && host && (
                <div>
                  <dt className="font-condensed text-lg font-semibold text-forest">{t('website')}</dt>
                  <dd>
                    <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-mint">
                      {host}
                      <span className="sr-only"> {t('newTab')}</span>
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <Link href="/exposants" className="link-underline mt-4 text-forest decoration-forest/40">{t('backToExhibitors')}</Link>
          </aside>
        </div>
      </div>
    </>
  )
}

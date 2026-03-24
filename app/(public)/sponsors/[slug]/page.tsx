import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: { slug: string }
}

interface Translations {
  en?: string
  de?: string
  es?: string
  it?: string
}

// Helper function to get translated text
function getTranslatedText(
  frenchText: string | null | undefined,
  translations: Translations | null | undefined,
  locale: string
): string {
  if (!frenchText) return ''
  if (locale === 'fr') return frenchText
  if (translations && locale in translations) {
    const translated = translations[locale as keyof Translations]
    if (translated && translated.trim() !== '') {
      return translated
    }
  }
  return frenchText
}

// Translations for the page
const pageTranslations = {
  fr: {
    home: 'Accueil',
    partners: 'Partenaires',
    platineSponsor: 'Sponsor Platine',
    partner: 'Partenaire',
    visitWebsite: 'Visiter le site web',
    findUsAtEvent: 'Retrouvez-nous au salon',
    stand: 'Stand',
    website: 'Site web',
    viewStandPlan: 'Voir le plan des stands',
    backToPartners: 'Retour aux partenaires',
    sponsorNotFound: 'Sponsor non trouvé',
  },
  en: {
    home: 'Home',
    partners: 'Partners',
    platineSponsor: 'Platinum Sponsor',
    partner: 'Partner',
    visitWebsite: 'Visit website',
    findUsAtEvent: 'Find us at the event',
    stand: 'Stand',
    website: 'Website',
    viewStandPlan: 'View stand map',
    backToPartners: 'Back to partners',
    sponsorNotFound: 'Sponsor not found',
  },
  de: {
    home: 'Startseite',
    partners: 'Partner',
    platineSponsor: 'Platin-Sponsor',
    partner: 'Partner',
    visitWebsite: 'Website besuchen',
    findUsAtEvent: 'Finden Sie uns auf der Veranstaltung',
    stand: 'Stand',
    website: 'Website',
    viewStandPlan: 'Standplan ansehen',
    backToPartners: 'Zurück zu den Partnern',
    sponsorNotFound: 'Sponsor nicht gefunden',
  },
  es: {
    home: 'Inicio',
    partners: 'Socios',
    platineSponsor: 'Patrocinador Platino',
    partner: 'Socio',
    visitWebsite: 'Visitar sitio web',
    findUsAtEvent: 'Encuéntrenos en el evento',
    stand: 'Stand',
    website: 'Sitio web',
    viewStandPlan: 'Ver plano de stands',
    backToPartners: 'Volver a socios',
    sponsorNotFound: 'Patrocinador no encontrado',
  },
  it: {
    home: 'Home',
    partners: 'Partner',
    platineSponsor: 'Sponsor Platino',
    partner: 'Partner',
    visitWebsite: 'Visita il sito web',
    findUsAtEvent: 'Trovaci all\'evento',
    stand: 'Stand',
    website: 'Sito web',
    viewStandPlan: 'Vedi mappa degli stand',
    backToPartners: 'Torna ai partner',
    sponsorNotFound: 'Sponsor non trovato',
  },
}

async function getSponsor(slug: string) {
  try {
    const sponsor = await prisma.sponsor.findUnique({
      where: { slug, isActive: true },
      include: { stand: true },
    })
    return sponsor
  } catch (error) {
    console.error('Error fetching sponsor:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const sponsor = await getSponsor(params.slug)

  if (!sponsor) {
    return { title: 'Sponsor non trouvé' }
  }

  return {
    title: sponsor.name,
    description: sponsor.description || `Découvrez ${sponsor.name}, partenaire du salon Cann'Agri Expo`,
  }
}

export default async function SponsorPage({ params }: PageProps) {
  const sponsor = await getSponsor(params.slug)

  if (!sponsor) {
    notFound()
  }

  // Get locale from cookie
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr'
  const t = pageTranslations[locale as keyof typeof pageTranslations] || pageTranslations.fr

  // Get translated content
  const articleTitle = getTranslatedText(
    sponsor.articleTitle,
    sponsor.articleTitleTranslations as Translations | null,
    locale
  )
  const articleBody = getTranslatedText(
    sponsor.articleBody,
    sponsor.articleBodyTranslations as Translations | null,
    locale
  )
  const description = getTranslatedText(
    sponsor.description,
    sponsor.descriptionTranslations as Translations | null,
    locale
  )

  const isPlatine = sponsor.type === 'PLATINE'

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-body/60">
            <li>
              <Link href="/" className="hover:text-forest">{t.home}</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/exposants" className="hover:text-forest">{t.partners}</Link>
            </li>
            <li>/</li>
            <li className="text-forest">{sponsor.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-white rounded-2xl p-8 mb-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Logo */}
                <div className="w-32 h-32 bg-sage/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  {sponsor.logoUrl ? (
                    <Image
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      width={100}
                      height={100}
                      className="object-contain"
                    />
                  ) : (
                    <svg className="w-16 h-16 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant={isPlatine ? 'forest' : 'sage'}>
                      {isPlatine ? t.platineSponsor : t.partner}
                    </Badge>
                    {sponsor.stand && (
                      <Badge variant="default">{t.stand} {sponsor.stand.number}</Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-heading font-bold text-heading mb-4">
                    {sponsor.name}
                  </h1>

                  <p className="text-body/70 mb-4">
                    {description || sponsor.description}
                  </p>

                  {sponsor.websiteUrl && (
                    <a
                      href={sponsor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-forest font-medium hover:underline"
                    >
                      {t.visitWebsite}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Article (Platine only) */}
            {isPlatine && articleTitle && (
              <Card variant="default" className="mb-8">
                {sponsor.articleImage && (
                  <div className="relative h-64 -mx-6 -mt-6 mb-6 bg-sage/20">
                    <Image
                      src={sponsor.articleImage}
                      alt={articleTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardContent>
                  <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                    {articleTitle}
                  </h2>
                  <div
                    className="prose prose-forest max-w-none text-body/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: articleBody }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="bordered" className="sticky top-24">
              <CardContent>
                <h3 className="text-lg font-heading font-semibold text-heading mb-4">
                  {t.findUsAtEvent}
                </h3>

                <div className="space-y-4 mb-6">
                  {sponsor.stand && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-body/60">{t.stand}</div>
                        <div className="font-semibold text-heading">{sponsor.stand.number}</div>
                      </div>
                    </div>
                  )}

                  {sponsor.websiteUrl && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-body/60">{t.website}</div>
                        <a
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-forest hover:underline"
                        >
                          {(() => {
                            try {
                              return new URL(sponsor.websiteUrl).hostname
                            } catch {
                              return sponsor.websiteUrl
                            }
                          })()}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/pro/plan">
                  <Button variant="outline" className="w-full">
                    {t.viewStandPlan}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/exposants"
            className="inline-flex items-center gap-2 text-forest font-medium hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToPartners}
          </Link>
        </div>
      </div>
    </div>
  )
}

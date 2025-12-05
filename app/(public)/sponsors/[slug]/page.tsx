import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Card, CardContent, Badge, Button } from '@/components/ui'

interface PageProps {
  params: { slug: string }
}

// Mock sponsor data for development
const mockSponsors = [
  {
    id: '1',
    slug: 'example-premium',
    name: 'Example Premium Sponsor',
    type: 'PREMIUM' as const,
    logoUrl: null,
    description: 'Description du sponsor premium. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    websiteUrl: 'https://example.com',
    standNumber: 'A1',
    articleTitle: 'Innovation dans le secteur CBD',
    articleBody: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    articleImage: null,
  },
  {
    id: '2',
    slug: 'example-standard',
    name: 'Example Standard Sponsor',
    type: 'STANDARD' as const,
    logoUrl: null,
    description: 'Description du sponsor standard.',
    websiteUrl: 'https://example.com',
    standNumber: 'B5',
    articleTitle: null,
    articleBody: null,
    articleImage: null,
  },
]

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const sponsor = mockSponsors.find((s) => s.slug === params.slug)

  if (!sponsor) {
    return { title: 'Sponsor non trouvé' }
  }

  return {
    title: sponsor.name,
    description: sponsor.description || `Découvrez ${sponsor.name}, partenaire du salon Cann'Agri Expo`,
  }
}

export default function SponsorPage({ params }: PageProps) {
  const sponsor = mockSponsors.find((s) => s.slug === params.slug)

  if (!sponsor) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-body/60">
            <li>
              <Link href="/" className="hover:text-forest">Accueil</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/exposants" className="hover:text-forest">Partenaires</Link>
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
                    <Badge variant={sponsor.type === 'PREMIUM' ? 'forest' : 'sage'}>
                      {sponsor.type === 'PREMIUM' ? 'Sponsor Premium' : 'Partenaire'}
                    </Badge>
                    {sponsor.standNumber && (
                      <Badge variant="default">Stand {sponsor.standNumber}</Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-heading font-bold text-heading mb-4">
                    {sponsor.name}
                  </h1>

                  <p className="text-body/70 mb-4">
                    {sponsor.description}
                  </p>

                  {sponsor.websiteUrl && (
                    <a
                      href={sponsor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-forest font-medium hover:underline"
                    >
                      Visiter le site web
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Article (Premium only) */}
            {sponsor.type === 'PREMIUM' && sponsor.articleTitle && (
              <Card variant="default" className="mb-8">
                {sponsor.articleImage && (
                  <div className="relative h-64 -mx-6 -mt-6 mb-6 bg-sage/20">
                    <Image
                      src={sponsor.articleImage}
                      alt={sponsor.articleTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardContent>
                  <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                    {sponsor.articleTitle}
                  </h2>
                  <div className="prose prose-forest max-w-none">
                    <p className="text-body/80 leading-relaxed">
                      {sponsor.articleBody}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="bordered" className="sticky top-24">
              <CardContent>
                <h3 className="text-lg font-heading font-semibold text-heading mb-4">
                  Retrouvez-nous au salon
                </h3>

                <div className="space-y-4 mb-6">
                  {sponsor.standNumber && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-body/60">Stand</div>
                        <div className="font-semibold text-heading">{sponsor.standNumber}</div>
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
                        <div className="text-sm text-body/60">Site web</div>
                        <a
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-forest hover:underline"
                        >
                          {new URL(sponsor.websiteUrl).hostname}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/pro/plan">
                  <Button variant="outline" className="w-full">
                    Voir le plan des stands
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
            Retour aux partenaires
          </Link>
        </div>
      </div>
    </div>
  )
}

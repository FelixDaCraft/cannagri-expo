'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent, Badge } from '@/components/ui'
import type { Sponsor } from '@/types'

interface Translations {
  en?: string
  de?: string
  es?: string
  it?: string
}

// Use the Sponsor type directly - Prisma JsonValue is compatible at runtime
interface SponsorsArticlesProps {
  sponsors: Sponsor[]
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

export function SponsorsArticles({ sponsors }: SponsorsArticlesProps) {
  const t = useTranslations('home.sponsors')
  const locale = useLocale()

  // Only show Platine sponsors with articles (article sponsorisé en 1ère page)
  const platineSponsors = sponsors.filter(
    (s) => s.type === 'PLATINE' && s.articleTitle && s.isActive
  )

  if (platineSponsors.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title">{t('featured')}</h2>
          <p className="section-subtitle">
            {t('featuredSubtitle')}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {platineSponsors.slice(0, 2).map((sponsor) => (
            <Link key={sponsor.id} href={`/sponsors/${sponsor.slug}`}>
              <Card
                variant="elevated"
                className="h-full overflow-hidden group cursor-pointer p-0"
              >
                {/* Image */}
                <div className="relative h-48 md:h-56 bg-sage/20 overflow-hidden">
                  {sponsor.articleImage ? (
                    <Image
                      src={sponsor.articleImage}
                      alt={sponsor.articleTitle || sponsor.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="relative w-24 h-24">
                        {sponsor.logoUrl && (
                          <Image
                            src={sponsor.logoUrl}
                            alt={sponsor.name}
                            fill
                            className="object-contain"
                          />
                        )}
                      </div>
                    </div>
                  )}
                  <Badge variant="forest" className="absolute top-4 left-4">
                    {t('platineSponsor')}
                  </Badge>
                </div>

                {/* Content */}
                <CardContent className="p-6">
                  <h3 className="text-xl font-heading font-semibold text-heading mb-2 group-hover:text-forest transition-colors">
                    {getTranslatedText(sponsor.articleTitle, sponsor.articleTitleTranslations as Translations | null, locale) || sponsor.name}
                  </h3>
                  <p className="text-body/70 text-sm line-clamp-3 mb-4">
                    {(() => {
                      const body = getTranslatedText(sponsor.articleBody, sponsor.articleBodyTranslations as Translations | null, locale)
                      return body
                        ? body.substring(0, 150) + '...'
                        : sponsor.description || t('discoverPartner')
                    })()}
                  </p>
                  <span className="inline-flex items-center gap-1 text-forest font-medium text-sm">
                    {t('readArticle')}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        {platineSponsors.length > 2 && (
          <div className="text-center mt-8">
            <Link
              href="/sponsors"
              className="inline-flex items-center gap-2 text-forest font-heading font-semibold hover:text-forest-600 transition-colors"
            >
              {t('viewAllPartners')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

// Static version for when no sponsors data is available
export function SponsorsArticlesPlaceholder() {
  const t = useTranslations('home.sponsors')

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('featured')}</h2>
          <p className="section-subtitle">
            {t('comingSoon')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <Card key={i} variant="bordered" className="h-64 flex items-center justify-center">
              <div className="text-center text-body/50">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p>{t('articleComingSoon')}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

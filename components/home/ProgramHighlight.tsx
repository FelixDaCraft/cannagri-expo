'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button, Badge } from '@/components/ui'

interface ProgramStats {
  conferenceCount: number
  speakerCount: number
  standCount: number
}

interface ProgramHighlightProps {
  stats?: ProgramStats
}

export function ProgramHighlight({ stats }: ProgramHighlightProps) {
  const t = useTranslations('home.program')

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title">{t('title')}</h2>
          <p className="section-subtitle">
            {t('subtitle')}
          </p>
        </div>

        {/* Programme à venir */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center p-8 md:p-12 rounded-2xl bg-gradient-to-br from-sage/10 to-forest/5 border border-sage/20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-forest/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <Badge variant="sage" className="mb-4">
              {t('comingSoon')}
            </Badge>

            <h3 className="text-2xl md:text-3xl font-heading font-bold text-heading mb-4">
              {t('programComingSoonTitle')}
            </h3>

            <p className="text-body/70 mb-6 leading-relaxed max-w-xl mx-auto">
              {t('programComingSoonDescription')}
            </p>

            <Link href="/programme">
              <Button>
                {t('viewFullProgram')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats - Only show if there are events */}
        {(stats?.conferenceCount || stats?.speakerCount) ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="text-center p-6 rounded-xl bg-cream">
              <div className="text-3xl md:text-4xl font-heading font-bold text-forest mb-1">
                {stats?.conferenceCount || 0}
              </div>
              <div className="text-body/60 text-sm">{t('stats.conferences')}</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-cream">
              <div className="text-3xl md:text-4xl font-heading font-bold text-forest mb-1">
                {stats?.speakerCount || 0}
              </div>
              <div className="text-body/60 text-sm">{t('stats.speakers')}</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-cream">
              <div className="text-3xl md:text-4xl font-heading font-bold text-forest mb-1">
                {stats?.standCount || 0}
              </div>
              <div className="text-body/60 text-sm">{t('stats.exhibitors')}</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-cream">
              <div className="text-3xl md:text-4xl font-heading font-bold text-forest mb-1">
                1
              </div>
              <div className="text-body/60 text-sm">{t('stats.award')}</div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

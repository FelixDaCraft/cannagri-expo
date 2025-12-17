'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Button, Badge } from '@/components/ui'
import { getTranslatedText, Translations } from '@/lib/translation'
import type { Event } from '@/types'

interface ProgramStats {
  conferenceCount: number
  speakerCount: number
  standCount: number
}

interface ProgramHighlightProps {
  event?: Event | null
  stats?: ProgramStats
}

export function ProgramHighlight({ event, stats }: ProgramHighlightProps) {
  const t = useTranslations('home.program')
  const locale = useLocale()

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

        {/* Featured Event */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            {/* Speaker Photo */}
            <div className="md:col-span-2">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-sage/20">
                {event?.speakerPhoto ? (
                  <Image
                    src={event.speakerPhoto}
                    alt={event.speakerName || 'Intervenant'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Event Info */}
            <div className="md:col-span-3">
              <Badge variant="forest" className="mb-4">
                {event?.type === 'CONFERENCE' ? t('eventTypes.conference') :
                 event?.type === 'WORKSHOP' ? t('eventTypes.workshop') :
                 event?.type === 'CEREMONY' ? t('eventTypes.ceremony') :
                 t('eventTypes.opening')}
              </Badge>

              <h3 className="text-2xl md:text-3xl font-heading font-bold text-heading mb-4">
                {event ? getTranslatedText(event.title, event.titleTranslations as Translations | null, locale) : t('defaultTitle')}
              </h3>

              <p className="text-body/70 mb-4 leading-relaxed">
                {event?.description
                  ? getTranslatedText(event.description, event.descriptionTranslations as Translations | null, locale)
                  : t('defaultDescription')}
              </p>

              {(event?.speakerName || !event) && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-heading">
                      {event?.speakerName || t('expertToConfirm')}
                    </p>
                    <p className="text-sm text-body/60">
                      {event?.speakerTitle || event?.speakerCompany || t('specialistSpeaker')}
                    </p>
                  </div>
                </div>
              )}

              <Link href="/programme">
                <Button>
                  {t('viewFullProgram')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
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
      </div>
    </section>
  )
}

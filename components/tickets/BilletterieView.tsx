'use client'

import { useLocale, useTranslations } from 'next-intl'
import { TicketForm } from './TicketForm'
import { siteConfig } from '@/config/site'
import { useEdition } from '@/components/editions'
import { PageHeader } from '@/components/ui/PageHeader'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { formatEditionDate, isTicketingOpen } from '@/lib/editions/format'
import type { TicketSelection } from '@/lib/editions/tickets'

// Read ticketing status from environment variable
const TICKETING_ENABLED = process.env.NEXT_PUBLIC_TICKETING_ENABLED === 'true'

export function BilletterieView({ initialSelection }: { initialSelection: TicketSelection }) {
  const edition = useEdition()
  const t = useTranslations('tickets')
  const locale = useLocale()
  const date = formatEditionDate(edition.startAt, locale) ?? t('dateTba')
  const lead = `${date} · ${edition.venueDisplay}`
  const mailLink = (
    <a href={`mailto:${siteConfig.contact.email}`} className="font-medium text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-mint">
      {siteConfig.contact.email}
    </a>
  )

  // Billetterie fermée (variable d'environnement ou hors de la période de vente de l'édition)
  if (!TICKETING_ENABLED || !isTicketingOpen(edition)) {
    return (
      <>
        <PageHeader eyebrow={`Cann'Agri Expo ${edition.year}`} title={t('title')} lead={lead} />
        <div className="bg-cream py-14 text-forest md:py-20">
          <div className="container-custom max-w-3xl">
            <h2 className="title-display">{t('closed.title')}</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink">{t('closed.text', { year: edition.year })}</p>
            <ul className="mt-6 divide-y divide-forest/15 border-y border-forest/15 font-condensed text-xl">
              <li className="flex justify-between gap-4 py-3">
                <span className="font-semibold">{t('closed.standard')}</span>
                <span className="font-semibold">{edition.standardTicketPrice} €</span>
              </li>
              <li className="flex justify-between gap-4 py-3">
                <span className="font-semibold">{t('closed.flex')}</span>
                <span className="font-semibold">{edition.flexTicketPrice} €</span>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/infos-pratiques">{t('closed.practicalInfo')}</ButtonLink>
              <ButtonLink href="/contact" tone="outline-night">{t('closed.contact')}</ButtonLink>
            </div>
            <div className="mt-12 border-t-2 border-forest pt-6">
              <p className="mb-4 text-lg text-ink">{t('closed.notify')}</p>
              <NewsletterForm source="billetterie" />
            </div>
          </div>
        </div>
      </>
    )
  }

  // Billetterie ouverte : le choix des billets d'abord, en-tête compact
  return (
    <>
      <PageHeader eyebrow={`Cann'Agri Expo ${edition.year}`} title={t('title')} lead={lead} className="[&>div]:pb-8 [&>div]:pt-8 md:[&>div]:pb-10 md:[&>div]:pt-10" />
      <div className="overflow-x-hidden bg-cream pb-28 pt-10 text-forest lg:pb-16">
        <div className="container-custom">
          <TicketForm initialSelection={initialSelection} />
          <p className="mt-12 text-base text-ink">{t('question')} {mailLink}</p>
        </div>
      </div>
    </>
  )
}

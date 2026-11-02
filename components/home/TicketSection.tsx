'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Ticket } from '@/components/ui/Ticket'
import { QuantityPicker } from '@/components/ui/QuantityPicker'
import { Reveal } from '@/components/ui/Reveal'
import { buttonClasses } from '@/components/ui/ButtonLink'
import { useEdition } from '@/components/editions'
import { buildTicketingHref, clampTicketQuantity, type TicketQuantities } from '@/lib/home/tickets'

type TicketKind = keyof TicketQuantities

/**
 * Deux vrais tickets (Standard et Flex) avec choix de la quantité.
 * Le bouton transmet le choix à la billetterie : /billetterie?standard=<n>&flex=<n>
 */
export function TicketSection() {
  const t = useTranslations('home.tickets')
  const edition = useEdition()
  const [quantities, setQuantities] = useState<TicketQuantities>({ standard: 0, flex: 0 })

  const prices: Record<TicketKind, number> = {
    standard: edition.standardTicketPrice,
    flex: edition.flexTicketPrice,
  }
  const count = quantities.standard + quantities.flex
  const total = quantities.standard * prices.standard + quantities.flex * prices.flex
  const update = (kind: TicketKind, value: number) =>
    setQuantities((q) => ({ ...q, [kind]: clampTicketQuantity(value) }))

  const kinds: { kind: TicketKind; tone: 'night' | 'flex'; tag?: string }[] = [
    { kind: 'standard', tone: 'night' },
    { kind: 'flex', tone: 'flex', tag: t('flex.tag') },
  ]

  return (
    <section id="billets" className="screen-section bg-cream py-[4.5rem] text-forest md:py-24" aria-labelledby="billets-title">
      <div className="container-custom">
        <Reveal>
          <h2 id="billets-title" className="font-display text-[3.75rem] font-normal leading-[.85] text-forest md:text-[5.5rem]">
            {t('title')}
          </h2>
          <p className="mt-5 max-w-[34em] text-[1.1875rem] leading-relaxed text-ink">
            {t('intro', { extra: prices.flex - prices.standard })}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:mt-14 md:gap-8 lg:grid-cols-2">
          {kinds.map(({ kind, tone, tag }, i) => (
            <Reveal key={kind} delay={i * 90} className="flex">
              <Ticket
                className="w-full"
                name={t(`${kind}.name`)}
                price={prices[kind]}
                unit={t('unit')}
                tag={tag}
                tone={tone}
                description={t(`${kind}.description`)}
                meta={t('meta')}
              >
                <QuantityPicker name={t(`${kind}.name`)} value={quantities[kind]} onChange={(v) => update(kind, v)} />
              </Ticket>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
          <Link
            href={buildTicketingHref(quantities)}
            className={buttonClasses({ tone: count > 0 ? 'gold' : 'night', size: 'lg' })}
          >
            {count > 0 ? t('continue', { count, total }) : t('choose')}
          </Link>
          <p className="font-condensed text-lg font-medium leading-snug text-ink">
            {t('conditions')}{' '}
            <Link href="/cgv" className="underline decoration-forest/40 underline-offset-4 hover:decoration-forest">
              {t('cgv')}
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Ticket } from '@/components/ui/Ticket'
import { Reveal } from '@/components/ui/Reveal'
import { buttonClasses } from '@/components/ui/ButtonLink'
import { useEdition } from '@/components/editions'
import { buildTicketingHref, clampTicketQuantity, MAX_TICKETS_PER_TYPE, type TicketQuantities } from '@/lib/home/tickets'

type TicketKind = keyof TicketQuantities

function QuantityPicker({
  name,
  value,
  onChange,
  t,
}: {
  name: string
  value: number
  onChange: (value: number) => void
  t: ReturnType<typeof useTranslations>
}) {
  const btn =
    'inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/40 text-cream transition-colors hover:border-cream hover:bg-cream/10 disabled:opacity-40 disabled:hover:bg-transparent'
  return (
    <div className="flex items-center gap-3 font-condensed">
      <span className="text-lg font-medium text-cream">{t('quantity')}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={btn}
          onClick={() => onChange(value - 1)}
          disabled={value <= 0}
          aria-label={t('decrease', { name })}
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2.5} d="M5 12h14" />
          </svg>
        </button>
        <output aria-live="polite" aria-label={t('quantityOf', { name })} className="w-9 text-center text-2xl font-semibold tabular-nums">
          {value}
        </output>
        <button
          type="button"
          className={btn}
          onClick={() => onChange(value + 1)}
          disabled={value >= MAX_TICKETS_PER_TYPE}
          aria-label={t('increase', { name })}
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  )
}

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
    <section id="billets" className="bg-cream py-[4.5rem] text-forest md:py-28" aria-labelledby="billets-title">
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
                <QuantityPicker name={t(`${kind}.name`)} value={quantities[kind]} onChange={(v) => update(kind, v)} t={t} />
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

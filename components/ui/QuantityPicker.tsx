'use client'

import { useTranslations } from 'next-intl'
import { MAX_TICKETS_PER_TYPE } from '@/lib/home/tickets'

/** Boutons − et + nommés (« Ajouter un Billet Standard »), 44 px, sur un billet bleu nuit ou vert */
export function QuantityPicker({
  name,
  value,
  onChange,
  max = MAX_TICKETS_PER_TYPE,
}: {
  name: string
  value: number
  onChange: (value: number) => void
  /** Plafond (par formule, ou ce qui reste avant le maximum par commande) */
  max?: number
}) {
  const t = useTranslations('home.tickets')
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
          disabled={value >= max}
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


import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type TicketTone = 'night' | 'flex'

interface TicketProps {
  /** « Billet Standard » */
  name: string
  /** Prix en euros, affiché en grand sur le talon */
  price: number
  /** Unité sous le prix (« euros ») */
  unit: string
  description?: ReactNode
  /** Ligne d'infos en Barlow Condensed (« Badge visiteur · e-billet par e-mail ») */
  meta?: ReactNode
  /** Petite annotation manuscrite à côté du nom (« merci ») */
  tag?: string
  tone?: TicketTone
  /** Couleur des encoches : celle du fond de la section */
  notchClassName?: string
  /** Contenu ajouté en bas du corps (sélecteur de quantité…) */
  children?: ReactNode
  className?: string
  as?: 'article' | 'div' | 'li'
}

const toneClasses: Record<TicketTone, { body: string; tag: string; stub: string }> = {
  night: { body: 'bg-forest', tag: 'text-mint', stub: 'border-cream/30' },
  // Vert mascotte assombri pour garder le texte crème lisible (4,7:1)
  flex: { body: 'bg-mascot-deep', tag: 'text-cream', stub: 'border-cream/40' },
}

/**
 * Billet à talon détachable : encoches rondes, pointillés, prix en Modak.
 * Signature visuelle de la charte 2027 (billetterie, accueil, bandeaux).
 */
export function Ticket({
  name,
  price,
  unit,
  description,
  meta,
  tag,
  tone = 'night',
  notchClassName = 'bg-cream',
  children,
  className,
  as: Tag = 'article',
}: TicketProps) {
  const t = toneClasses[tone]
  return (
    <Tag
      className={cn(
        'relative grid grid-cols-[1fr_6.5rem] sm:grid-cols-[1fr_10.5rem] rounded-2xl text-cream overflow-hidden',
        t.body,
        className
      )}
    >
      {/* Encoches du talon */}
      <span
        aria-hidden="true"
        className={cn('absolute -top-3.5 right-[calc(6.5rem-0.875rem)] sm:right-[calc(10.5rem-0.875rem)] h-7 w-7 rounded-full', notchClassName)}
      />
      <span
        aria-hidden="true"
        className={cn('absolute -bottom-3.5 right-[calc(6.5rem-0.875rem)] sm:right-[calc(10.5rem-0.875rem)] h-7 w-7 rounded-full', notchClassName)}
      />

      <div className="flex flex-col p-5 sm:p-8 sm:pl-9">
        <h3 className="font-condensed text-[1.75rem] sm:text-[2.125rem] font-semibold leading-none text-cream">
          {name}
          {tag && (
            <span className={cn('ml-2.5 inline-block -rotate-[4deg] font-accent text-[1.375rem] font-normal', t.tag)}>
              {tag}
            </span>
          )}
        </h3>
        {description && <p className="mt-3 max-w-[22em] text-[1.0625rem] leading-snug text-cream">{description}</p>}
        {meta && <p className="mt-4 font-condensed text-base font-medium leading-snug text-cream/80">{meta}</p>}
        {children && <div className="mt-auto pt-5">{children}</div>}
      </div>

      <div className={cn('flex flex-col items-center justify-center gap-1 border-l-2 border-dashed px-3 py-6 sm:px-4', t.stub)}>
        <span className="font-display text-[4.5rem] sm:text-[6.5rem] leading-[.8] text-cream">{price}</span>
        <span className="font-condensed text-lg sm:text-[1.375rem] font-semibold leading-none text-cream/80">{unit}</span>
      </div>
    </Tag>
  )
}

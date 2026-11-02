import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: ReactNode
  /** Une ligne utile sous le titre (pas de paragraphe) */
  lead?: ReactNode
  /** Surtitre en Barlow Condensed (« Cann'Agri Expo 2027 ») */
  eyebrow?: ReactNode
  /** Actions ou infos supplémentaires sous la ligne utile */
  children?: ReactNode
  className?: string
}

/**
 * En-tête des pages intérieures : bandeau bleu nuit à bord net, titre en Modak.
 * Un seul modèle pour tout le site (constats n°11 et n°25 de l'audit).
 */
export function PageHeader({ title, lead, eyebrow, children, className }: PageHeaderProps) {
  return (
    <header className={cn('bg-forest text-cream', className)}>
      <div className="container-custom pt-12 pb-12 md:pt-16 md:pb-16">
        {eyebrow && (
          <p className="mb-3 font-condensed text-lg font-semibold leading-none text-mint">{eyebrow}</p>
        )}
        <h1 className="font-display text-[3.25rem] md:text-[4.5rem] lg:text-[5.5rem] font-normal leading-[.85] text-cream text-balance">
          {title}
        </h1>
        {lead && <p className="mt-5 max-w-[40em] text-lg md:text-xl leading-snug text-cream/80">{lead}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  )
}

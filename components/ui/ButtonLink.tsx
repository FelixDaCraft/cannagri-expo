import Link from 'next/link'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Rôles des couleurs (charte 2027) :
 * - `gold` : l'action principale (acheter, demander la plaquette). L'or est réservé aux actions.
 * - `night` : action secondaire sur fond crème.
 * - `outline-cream` / `outline-night` : action discrète sur fond bleu nuit / crème.
 */
export type ButtonTone = 'gold' | 'night' | 'outline-cream' | 'outline-night'
export type ButtonSize = 'sm' | 'md' | 'lg'

const tones: Record<ButtonTone, string> = {
  gold: 'bg-mint text-forest hover:bg-mint-400 focus-visible:outline-mint',
  night: 'bg-forest text-cream hover:bg-forest-400 focus-visible:outline-forest',
  'outline-cream': 'border-2 border-cream/50 text-cream hover:border-cream hover:bg-cream/10 focus-visible:outline-mint',
  'outline-night': 'border-2 border-forest/40 text-forest hover:border-forest hover:bg-forest/5 focus-visible:outline-forest',
}

const sizes: Record<ButtonSize, string> = {
  // 44 px minimum : cible tactile confortable même pour le petit bouton du header
  sm: 'h-11 px-4 text-lg',
  md: 'h-12 px-6 text-xl',
  lg: 'h-14 px-8 text-[1.375rem]',
}

export function buttonClasses({ tone = 'gold', size = 'md' }: { tone?: ButtonTone; size?: ButtonSize } = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-[10px] font-condensed font-semibold leading-none whitespace-nowrap',
    'transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[.98] motion-reduce:active:scale-100',
    'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2',
    tones[tone],
    sizes[size]
  )
}

type ButtonLinkProps = ComponentProps<typeof Link> & { tone?: ButtonTone; size?: ButtonSize }

/** Lien à l'allure de bouton : un seul élément focalisable (pas de <button> dans un <a>) */
export function ButtonLink({ tone, size, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonClasses({ tone, size }), className)} {...props} />
}

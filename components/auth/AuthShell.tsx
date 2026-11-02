import type { ReactNode } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'

/**
 * Gabarit des pages de compte (connexion, inscription, mot de passe, vérification, invitation) :
 * bandeau bleu nuit puis le formulaire dans une carte crème à bord net.
 */
export function AuthShell({
  eyebrow,
  title,
  lead,
  children,
  after,
  wide = false,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  lead?: ReactNode
  children: ReactNode
  /** Contenu sous la carte (mentions, liens secondaires) */
  after?: ReactNode
  wide?: boolean
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} lead={lead} className="[&_h1]:text-[2.75rem] md:[&_h1]:text-[4rem] lg:[&_h1]:text-[4.5rem]" />
      <div className="bg-cream py-12 text-forest md:py-16">
        <div className={wide ? 'container-custom max-w-3xl' : 'container-custom max-w-xl'}>
          <div className="rounded-2xl border-2 border-forest bg-cream-100 p-6 md:p-8">{children}</div>
          {after && <div className="mt-6 text-base text-ink">{after}</div>}
        </div>
      </div>
    </>
  )
}

export const authLinkClass = 'font-medium text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-mint'

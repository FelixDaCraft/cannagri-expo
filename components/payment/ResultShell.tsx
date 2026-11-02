import type { ReactNode } from 'react'

/** Mise en page commune des pages de résultat (paiement, vérification d'e-mail…) : bandeau bleu nuit, carte crème */
export function ResultShell({ eyebrow, title, children, tone = 'neutral' }: { eyebrow?: ReactNode; title: ReactNode; children: ReactNode; tone?: 'neutral' | 'success' | 'error' }) {
  return (
    <>
      <div className="bg-forest text-cream">
        <div className="container-custom max-w-3xl pb-24 pt-12 md:pt-16">
          {eyebrow && <p className="mb-3 font-condensed text-lg font-semibold text-mint">{eyebrow}</p>}
          <h1 className="font-display text-[2.75rem] font-normal leading-[.9] text-cream md:text-[4rem] text-balance">{title}</h1>
        </div>
      </div>
      <div className="bg-cream pb-16 text-forest">
        <div className="container-custom max-w-3xl">
          <div
            className={
              '-mt-14 rounded-2xl border-2 bg-cream-100 p-6 md:p-10 ' +
              (tone === 'error' ? 'border-red-800/60' : tone === 'success' ? 'border-mascot-deep' : 'border-forest')
            }
          >
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

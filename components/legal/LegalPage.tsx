import type { ReactNode } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'

export interface TocItem {
  id: string
  label: string
}

/**
 * Pages légales (CGV, mentions légales, confidentialité) : sommaire en tête, sections aérées
 * et lisibles (constat n°31). Le texte juridique reste en français.
 */
export function LegalPage({ title, updated, toc, children }: { title: string; updated: string; toc: TocItem[]; children: ReactNode }) {
  return (
    <>
      <PageHeader eyebrow="Informations légales" title={title} lead={updated} />
      <div className="bg-cream py-12 text-forest md:py-16">
        <div className="container-custom grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          <nav aria-labelledby="toc-title" className="lg:sticky lg:top-24 lg:self-start">
            <h2 id="toc-title" className="font-condensed text-xl font-semibold">Sommaire</h2>
            <ol className="mt-3 space-y-1 border-l-2 border-forest/15">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="-ml-0.5 flex min-h-[44px] items-center border-l-2 border-transparent pl-4 text-base text-ink hover:border-mint hover:text-forest lg:min-h-0 lg:py-1.5">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <article className="legal-prose max-w-[46rem]">{children}</article>
        </div>
      </div>
    </>
  )
}

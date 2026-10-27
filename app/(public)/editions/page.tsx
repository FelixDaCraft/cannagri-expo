import type { Metadata } from 'next'
import Link from 'next/link'
import { editionService, formatEditionDate } from '@/lib/editions'

export const metadata: Metadata = {
  title: 'Éditions passées',
  description: "Retrouvez les éditions précédentes de Cann'Agri Expo : programme, partenaires, exposants et photos.",
}

export default async function EditionsArchivePage() {
  const editions = await editionService.listArchived()

  return (
    <div className="min-h-screen bg-cream">
      <section className="py-16 md:py-24 bg-gradient-to-br from-forest via-forest to-forest-600">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-4">Éditions passées</h1>
          <p className="text-lg text-cream/80 max-w-2xl mx-auto">
            Programme, partenaires, exposants et photos des précédentes éditions de Cann&apos;Agri Expo.
          </p>
        </div>
      </section>

      <div className="container-custom py-12">
        {editions.length === 0 ? (
          <p className="text-center text-body/70">Aucune édition archivée pour le moment.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {editions.map((edition) => (
              <li key={edition.id}>
                <Link
                  href={`/editions/${edition.year}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sage/20 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  {edition.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={edition.posterUrl}
                      alt={`Affiche Cann'Agri Expo ${edition.year}`}
                      className="aspect-[3/4] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[3/4] w-full bg-forest flex items-center justify-center">
                      <span className="font-heading text-6xl font-bold text-cream/90">{edition.year}</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-heading text-2xl font-bold text-heading">Édition {edition.year}</h2>
                    {(edition.startAt || edition.venueName) && (
                      <p className="mt-1 text-sm text-body/70">
                        {[formatEditionDate(edition.startAt), [edition.venueName, edition.city].filter(Boolean).join(', ')]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                    <span className="mt-4 text-sm font-semibold text-forest group-hover:underline">
                      Revoir cette édition →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

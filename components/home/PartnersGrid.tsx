import Image from 'next/image'
import Link from 'next/link'
import type { Sponsor } from '@/types'

interface PartnersGridProps {
  sponsors: Sponsor[]
}

export function PartnersGrid({ sponsors }: PartnersGridProps) {
  const activeSponsors = sponsors.filter((s) => s.isActive)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title">Nos Partenaires</h2>
          <p className="section-subtitle">
            Merci à nos partenaires qui rendent cet événement possible
          </p>
        </div>

        {/* Partners Grid */}
        {activeSponsors.length > 0 ? (
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {activeSponsors.map((sponsor) => (
              <Link
                key={sponsor.id}
                href={`/sponsors/${sponsor.slug}`}
                className="group relative"
              >
                <div className="w-32 h-20 md:w-40 md:h-24 relative grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  {sponsor.logoUrl ? (
                    <Image
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-sage/10 rounded-lg flex items-center justify-center">
                      <span className="font-heading font-semibold text-forest/50 text-center text-sm px-2">
                        {sponsor.name}
                      </span>
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-body/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {sponsor.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <PartnersGridPlaceholder />
        )}

        {/* Become a Partner CTA */}
        <div className="text-center mt-16">
          <div className="inline-block p-8 bg-cream rounded-2xl">
            <h3 className="text-xl font-heading font-semibold text-heading mb-2">
              Devenez Partenaire
            </h3>
            <p className="text-body/70 text-sm mb-4 max-w-md mx-auto">
              Associez votre marque au salon de référence du chanvre CBD
            </p>
            <Link
              href="/pro/sponsoring"
              className="inline-flex items-center gap-2 text-forest font-heading font-semibold hover:text-forest-600 transition-colors"
            >
              Découvrir nos offres
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function PartnersGridPlaceholder() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="w-32 h-20 md:w-40 md:h-24 bg-sage/10 rounded-lg flex items-center justify-center"
        >
          <span className="text-sage/50 text-sm">Logo</span>
        </div>
      ))}
    </div>
  )
}

export function PartnersGridStatic() {
  return <PartnersGrid sponsors={[]} />
}

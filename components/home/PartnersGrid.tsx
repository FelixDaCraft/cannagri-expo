'use client'

import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import { useTranslations } from 'next-intl'
import type { Sponsor } from '@/types'

// Tailles des logos selon le type de partenaire
const sponsorSizes = {
  PLATINE: { width: 'w-48 md:w-56', height: 'h-28 md:h-32' },
  OR: { width: 'w-40 md:w-48', height: 'h-24 md:h-28' },
  ARGENT: { width: 'w-32 md:w-40', height: 'h-20 md:h-24' },
  BRONZE: { width: 'w-24 md:w-32', height: 'h-16 md:h-20' },
}

interface PartnersGridProps {
  sponsors: Sponsor[]
}

export function PartnersGrid({ sponsors }: PartnersGridProps) {
  const t = useTranslations('home.sponsors')
  const activeSponsors = sponsors.filter((s) => s.isActive)

  // Grouper par type
  const platineSponsors = activeSponsors.filter((s) => s.type === 'PLATINE')
  const orSponsors = activeSponsors.filter((s) => s.type === 'OR')
  const argentSponsors = activeSponsors.filter((s) => s.type === 'ARGENT')
  const bronzeSponsors = activeSponsors.filter((s) => s.type === 'BRONZE')

  // Section masquée tant qu'aucun partenaire n'est publié (l'invitation est dans ProSection)
  if (activeSponsors.length === 0) return null

  return (
    <section className="bg-cream py-[4.5rem] md:py-24" aria-labelledby="partenaires-title">
      <div className="container-custom">
        {/* Section Header */}
        <Reveal className="text-center mb-12">
          <h2 id="partenaires-title" className="font-display text-[3.75rem] font-normal leading-[.85] text-forest md:text-[5.5rem]">
            {t('title')}
          </h2>
          <p className="mx-auto mt-5 max-w-[34em] text-[1.1875rem] leading-relaxed text-ink">{t('subtitle')}</p>
        </Reveal>

        {/* Partners Grid by tier */}
        <div className="space-y-12">
          {/* Platine */}
          {platineSponsors.length > 0 && (
            <SponsorTier sponsors={platineSponsors} type="PLATINE" label={t('tiers.platinum')} />
          )}

          {/* Or */}
          {orSponsors.length > 0 && (
            <SponsorTier sponsors={orSponsors} type="OR" label={t('tiers.gold')} />
          )}

          {/* Argent */}
          {argentSponsors.length > 0 && (
            <SponsorTier sponsors={argentSponsors} type="ARGENT" label={t('tiers.silver')} />
          )}

          {/* Bronze */}
          {bronzeSponsors.length > 0 && (
            <SponsorTier sponsors={bronzeSponsors} type="BRONZE" label={t('tiers.bronze')} />
          )}
        </div>
      </div>
    </section>
  )
}

function SponsorTier({ sponsors, type, label }: { sponsors: Sponsor[]; type: keyof typeof sponsorSizes; label: string }) {
  const sizes = sponsorSizes[type]

  return (
    <Reveal>
      <h3 className="mb-6 text-center font-condensed text-xl font-semibold text-gold-ink">
        {label}
      </h3>
      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
        {sponsors.map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.websiteUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={sponsor.name}
            className="group relative"
          >
            <div className={`${sizes.width} ${sizes.height} relative grayscale hover:grayscale-0 transition-all duration-300 opacity-80 hover:opacity-100`}>
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
          </a>
        ))}
      </div>
    </Reveal>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import type { Sponsor } from '@/types'

// Tailles des logos selon le type de partenaire
const sponsorSizes = {
  PLATINUM: { width: 'w-48 md:w-56', height: 'h-28 md:h-32' },
  GOLD: { width: 'w-40 md:w-48', height: 'h-24 md:h-28' },
  SILVER: { width: 'w-32 md:w-40', height: 'h-20 md:h-24' },
  BRONZE: { width: 'w-24 md:w-32', height: 'h-16 md:h-20' },
}

const sponsorLabels = {
  PLATINUM: 'Partenaires Platinum',
  GOLD: 'Partenaires Or',
  SILVER: 'Partenaires Argent',
  BRONZE: 'Partenaires Bronze',
}

interface PartnersGridProps {
  sponsors: Sponsor[]
}

export function PartnersGrid({ sponsors }: PartnersGridProps) {
  const activeSponsors = sponsors.filter((s) => s.isActive)

  // Grouper par type
  const platinumSponsors = activeSponsors.filter((s) => s.type === 'PLATINUM')
  const goldSponsors = activeSponsors.filter((s) => s.type === 'GOLD')
  const silverSponsors = activeSponsors.filter((s) => s.type === 'SILVER')
  const bronzeSponsors = activeSponsors.filter((s) => s.type === 'BRONZE')

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Nos Partenaires</h2>
          <p className="section-subtitle">
            Merci à nos partenaires qui rendent cet événement possible
          </p>
        </motion.div>

        {/* Partners Grid by tier */}
        {activeSponsors.length > 0 ? (
          <div className="space-y-12">
            {/* Platinum */}
            {platinumSponsors.length > 0 && (
              <SponsorTier sponsors={platinumSponsors} type="PLATINUM" />
            )}

            {/* Gold */}
            {goldSponsors.length > 0 && (
              <SponsorTier sponsors={goldSponsors} type="GOLD" />
            )}

            {/* Silver */}
            {silverSponsors.length > 0 && (
              <SponsorTier sponsors={silverSponsors} type="SILVER" />
            )}

            {/* Bronze */}
            {bronzeSponsors.length > 0 && (
              <SponsorTier sponsors={bronzeSponsors} type="BRONZE" />
            )}
          </div>
        ) : (
          <PartnersGridPlaceholder />
        )}

        {/* Become a Partner CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
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
        </motion.div>
      </div>
    </section>
  )
}

function SponsorTier({ sponsors, type }: { sponsors: Sponsor[]; type: keyof typeof sponsorSizes }) {
  const sizes = sponsorSizes[type]
  const label = sponsorLabels[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h3 className="text-center text-sm font-medium text-forest/60 uppercase tracking-wider mb-6">
        {label}
      </h3>
      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
        {sponsors.map((sponsor) => (
          <motion.a
            key={sponsor.id}
            href={sponsor.websiteUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
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
          </motion.a>
        ))}
      </div>
    </motion.div>
  )
}

function PartnersGridPlaceholder() {
  return (
    <div className="space-y-12">
      {/* Platinum placeholders */}
      <div>
        <h3 className="text-center text-sm font-medium text-forest/60 uppercase tracking-wider mb-6">
          Partenaires Platinum
        </h3>
        <div className="flex justify-center gap-10">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-48 h-28 md:w-56 md:h-32 bg-sage/10 rounded-lg flex items-center justify-center"
            >
              <span className="text-sage/50 text-sm">Logo Platinum</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gold placeholders */}
      <div>
        <h3 className="text-center text-sm font-medium text-forest/60 uppercase tracking-wider mb-6">
          Partenaires Or
        </h3>
        <div className="flex flex-wrap justify-center gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-40 h-24 md:w-48 md:h-28 bg-sage/10 rounded-lg flex items-center justify-center"
            >
              <span className="text-sage/50 text-sm">Logo Or</span>
            </div>
          ))}
        </div>
      </div>

      {/* Silver placeholders */}
      <div>
        <h3 className="text-center text-sm font-medium text-forest/60 uppercase tracking-wider mb-6">
          Partenaires Argent
        </h3>
        <div className="flex flex-wrap justify-center gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-32 h-20 md:w-40 md:h-24 bg-sage/10 rounded-lg flex items-center justify-center"
            >
              <span className="text-sage/50 text-xs">Logo Argent</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bronze placeholders */}
      <div>
        <h3 className="text-center text-sm font-medium text-forest/60 uppercase tracking-wider mb-6">
          Partenaires Bronze
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-24 h-16 md:w-32 md:h-20 bg-sage/10 rounded-lg flex items-center justify-center"
            >
              <span className="text-sage/50 text-xs">Logo</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PartnersGridStatic() {
  return <PartnersGrid sponsors={[]} />
}

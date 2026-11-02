'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import type { Sponsor } from '@/types'

// Tailles des logos selon le type de partenaire
const sponsorSizes = {
  PLATINE: { width: 'w-48 md:w-56', height: 'h-28 md:h-32' },
  OR: { width: 'w-40 md:w-48', height: 'h-24 md:h-28' },
  ARGENT: { width: 'w-32 md:w-40', height: 'h-20 md:h-24' },
  BRONZE: { width: 'w-24 md:w-32', height: 'h-16 md:h-20' },
}

// Labels seront chargés via les traductions

// Contreparties par type de sponsor
const sponsorBenefits = {
  PLATINE: {
    publications: 1,
    stories: 4,
    position: 'En-tête',
    articleHomepage: true,
  },
  OR: {
    publications: 1,
    stories: 3,
    position: 'En-tête',
    articleHomepage: false,
  },
  ARGENT: {
    publications: 1,
    stories: 2,
    position: 'Milieu',
    articleHomepage: false,
  },
  BRONZE: {
    publications: 1,
    stories: 1,
    position: 'Bas de page',
    articleHomepage: false,
  },
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

  // Tant qu'aucun partenaire n'est publié, seule l'invitation à devenir partenaire est affichée
  if (activeSponsors.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <BecomePartnerCta className="" />
        </div>
      </section>
    )
  }

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
          <h2 className="section-title">{t('title')}</h2>
          <p className="section-subtitle">
            {t('subtitle')}
          </p>
        </motion.div>

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

        <BecomePartnerCta />
      </div>
    </section>
  )
}

function BecomePartnerCta({ className = 'mt-16' }: { className?: string }) {
  const t = useTranslations('home.sponsors')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`text-center ${className}`}
    >
      <div className="inline-block p-8 bg-cream rounded-2xl">
        <h3 className="text-xl font-heading font-semibold text-heading mb-2">
          {t('becomePartner')}
        </h3>
        <p className="text-body/70 text-sm mb-4 max-w-md mx-auto">
          {t('becomePartnerSubtitle')}
        </p>
        <Link
          href="/sponsoring"
          className="inline-flex items-center gap-2 text-forest font-heading font-semibold hover:text-forest-600 transition-colors"
        >
          {t('discoverOffers')}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </motion.div>
  )
}

function SponsorTier({ sponsors, type, label }: { sponsors: Sponsor[]; type: keyof typeof sponsorSizes; label: string }) {
  const sizes = sponsorSizes[type]

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

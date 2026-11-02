'use client'

import { motion } from 'motion/react'
import { TicketForm } from './TicketForm'
import { Spotlight, FloatingParticles } from '@/components/ui/aceternity'
import { siteConfig } from '@/config/site'
import Link from 'next/link'
import { useEdition } from '@/components/editions'
import { isTicketingOpen } from '@/lib/editions/format'
import type { TicketSelection } from '@/lib/editions/tickets'

// Read ticketing status from environment variable
const TICKETING_ENABLED = process.env.NEXT_PUBLIC_TICKETING_ENABLED === 'true'

export function BilletterieView({ initialSelection }: { initialSelection: TicketSelection }) {
  const edition = useEdition()
  // Show "Coming Soon" message when ticketing is disabled or outside the edition's sales window
  if (!TICKETING_ENABLED || !isTicketingOpen(edition)) {
    return (
      <div className="min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-forest via-forest to-forest-600 overflow-hidden">
          <Spotlight className="-top-40 left-20" fill="#C9A04A" />
          <Spotlight className="top-20 right-0" fill="#5E8F62" />
          <FloatingParticles quantity={40} colors={['rgba(164, 180, 148, 0.5)', 'rgba(244, 241, 232, 0.3)']} />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-sage/20 backdrop-blur-sm border border-sage/30"
              >
                <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </motion.div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-cream mb-6">
                Billetterie
              </h1>
              <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto mb-6">
                Réservez votre place pour le salon professionnel du cannabis CBD
              </p>
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-cream/10 backdrop-blur-sm rounded-full border border-cream/20">
                <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-cream">{edition.dateDisplay}</span>
                <span className="text-cream/60">•</span>
                <span className="text-cream/80">{edition.venueDisplay}</span>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
        </section>

        {/* Coming Soon Content */}
        <div className="container-custom py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-sage/10 p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-heading mb-4">
                Billetterie bientôt disponible
              </h2>
              <p className="text-body/70 mb-8">
                La vente des billets pour Cann&apos;Agri Expo {edition.year} ouvrira prochainement.
                Inscrivez-vous à notre newsletter pour être informé de l&apos;ouverture de la billetterie.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-forest text-white font-medium rounded-lg hover:bg-forest/90 transition-colors"
                >
                  Retour à l&apos;accueil
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-forest font-medium rounded-lg border-2 border-forest hover:bg-forest/5 transition-colors"
                >
                  Nous contacter
                </Link>
              </div>
            </div>

            {/* Event Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 bg-sage/10 rounded-xl"
            >
              <h3 className="font-heading font-semibold text-heading mb-3">
                Informations sur l&apos;événement
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-body/70">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{edition.dateDisplay}</span>
                </div>
                <span className="hidden md:block text-body/30">•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{edition.venueDisplay}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Billetterie ouverte : le choix des billets d'abord, en-tête compact
  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      <section className="bg-forest py-8 md:py-12">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-cream mb-3">
            Billetterie
          </h1>
          <p className="text-cream/90 font-medium">
            {edition.dateDisplay}
            <span aria-hidden="true" className="mx-2 text-cream/60">·</span>
            <span className="sr-only">, </span>
            {edition.venueDisplay}
          </p>
        </div>
      </section>

      <div className="container-custom pt-6 pb-28 lg:pb-12">
        <p className="mb-8 text-sm text-body/80 text-center">
          E-billet avec QR code envoyé par e-mail
          <span aria-hidden="true" className="mx-2">·</span>
          <span className="sr-only">, </span>
          paiement sécurisé 3D Secure
          <span aria-hidden="true" className="mx-2">·</span>
          <span className="sr-only">, </span>
          sans création de compte
        </p>

        <TicketForm initialSelection={initialSelection} />

        <p className="mt-12 text-center text-body/80">
          Une question ? Contactez-nous à{' '}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-forest hover:underline font-medium">
            {siteConfig.contact.email}
          </a>
        </p>
      </div>
    </div>
  )
}

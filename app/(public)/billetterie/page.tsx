'use client'

import { motion } from 'motion/react'
import { TicketForm } from '@/components/tickets'
import { Spotlight, FloatingParticles } from '@/components/ui/aceternity'
import { siteConfig } from '@/config/site'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'E-billet instantané',
    description: 'Recevez votre billet avec QR code par email immédiatement après paiement.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Paiement sécurisé',
    description: 'Transactions 100% sécurisées avec protocole 3D Secure.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Accès prioritaire',
    description: 'Évitez les files d\'attente avec votre QR code à scanner.',
  },
]

export default function BilletteriePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-forest via-forest to-forest-600 overflow-hidden">
        <Spotlight className="-top-40 left-20" fill="#A4B494" />
        <Spotlight className="top-20 right-0" fill="#4a6b50" />
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
              Réservez votre place pour le salon de référence du chanvre CBD
            </p>
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-cream/10 backdrop-blur-sm rounded-full border border-cream/20">
              <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-cream">{siteConfig.event.date}</span>
              <span className="text-cream/60">•</span>
              <span className="text-cream/80">{siteConfig.event.location}, {siteConfig.event.city}</span>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
      </section>

      <div className="container-custom py-12">
        {/* Features - Mobile Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 -mx-4 px-4 overflow-x-auto scrollbar-hide md:overflow-visible"
        >
          <div className="flex md:grid md:grid-cols-3 gap-4 min-w-max md:min-w-0">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="flex-shrink-0 w-72 md:w-auto bg-white rounded-xl p-5 shadow-sm border border-sage/10"
              >
                <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center text-forest mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-semibold text-heading mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-body/70">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Ticket Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TicketForm />
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-body/60">
            Une question ? Contactez-nous à{' '}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-forest hover:underline font-medium">
              {siteConfig.contact.email}
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

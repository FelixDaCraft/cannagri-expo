'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui'
import { siteConfig } from '@/config/site'
import { CountdownTimer } from './CountdownTimer'

export function HeroSection() {
  const t = useTranslations('home.hero')
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/affiche-2026.png"
          alt="Background"
          className="w-full h-full object-cover scale-100"
        />
        {/* Overlay sombre pour lisibilité */}
        <div className="absolute inset-0 bg-forest/70" />
      </div>

      {/* Contenu principal */}
      <div className="container-custom relative z-10 pt-20 pb-24 md:pt-28 md:pb-32 min-h-screen flex flex-col justify-center">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Poster Image - côté gauche */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative w-full max-w-sm lg:max-w-md flex-shrink-0"
          >
            {/* Glow derrière le poster */}
            <div className="absolute inset-0 bg-cream/20 rounded-3xl blur-3xl transform scale-95" />

            {/* Container du poster */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-cream/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/affiche-2026.png"
                  alt="Cann'Agri Expo 2026 - Affiche officielle"
                  className="w-full h-auto"
                />
              </div>

              {/* Badge "Édition 2026" */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: -12 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="absolute -top-4 -right-4 md:-top-6 md:-right-6"
              >
                <div className="bg-terracotta text-cream px-4 py-2 rounded-full font-heading font-bold text-sm md:text-base shadow-lg transform rotate-12">
                  {t('edition')}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Contenu texte - côté droit */}
          <div className="flex-1 text-center lg:text-left">
            {/* Titre principal - Style affiche */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold text-cream mb-4 leading-none tracking-tight"
              style={{ fontFamily: 'var(--font-heading), serif' }}
            >
              CANN&apos;AGRI
              <br />
              <span className="text-terracotta">EXPO</span>
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-cream/90 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              {t('subtitle')}
            </motion.p>

            {/* Info événement - Date et Lieu */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8"
            >
              <div className="flex items-center gap-3 px-5 py-3 bg-cream/10 backdrop-blur-md rounded-xl border border-cream/20">
                <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-heading font-bold text-cream text-lg">{siteConfig.event.date}</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-cream/10 backdrop-blur-md rounded-xl border border-cream/20">
                <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-heading font-bold text-cream text-lg">{siteConfig.event.location}, {siteConfig.event.city}</span>
              </div>
            </motion.div>

            {/* Countdown intégré */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-10"
            >
              <CountdownTimer variant="hero" />
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/billetterie">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-terracotta hover:bg-terracotta-600 text-white shadow-lg shadow-terracotta/30 hover:shadow-terracotta/50 transition-all text-lg px-8"
                  >
                    {t('buyTicket')}
                  </Button>
                </motion.div>
              </Link>
              <Link href="/infos-pratiques">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-cream text-cream hover:bg-cream hover:text-forest text-lg px-8"
                  >
                    {t('practicalInfo')}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-cream/50 text-xs uppercase tracking-widest">{t('discover')}</span>
          <svg className="w-5 h-5 text-cream/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}

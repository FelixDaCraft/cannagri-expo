'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Button } from '@/components/ui'
import { FloatingParticles } from '@/components/ui/aceternity'
import { siteConfig } from '@/config/site'

// Tags inspirés de l'affiche
const tags = [
  { label: 'PRODUCTEURS DE CBD', rotation: -2 },
  { label: 'MATÉRIEL DE CULTURE', rotation: 1 },
  { label: 'FOOD', rotation: -1 },
  { label: 'CONFÉRENCES', rotation: 2 },
  { label: 'TATTOO', rotation: -2 },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-mint">
      {/* Fond avec effet grain subtil */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Particles - style fumée */}
      <FloatingParticles
        className="z-0"
        quantity={40}
        colors={['rgba(244, 241, 232, 0.4)', 'rgba(61, 90, 69, 0.2)', 'rgba(143, 181, 139, 0.3)']}
        minSize={2}
        maxSize={6}
      />

      {/* Cercles décoratifs */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-cream/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-forest/10 rounded-full blur-3xl" />

      <div className="container-custom relative z-10 pt-8 pb-24 md:pt-12 md:pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Poster Image - côté gauche */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotate: -5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl flex-shrink-0"
          >
            {/* Glow derrière le poster */}
            <div className="absolute inset-0 bg-cream/30 rounded-3xl blur-3xl transform scale-95" />

            {/* Ombre portée */}
            <div className="absolute inset-0 bg-forest/20 rounded-3xl transform translate-x-4 translate-y-4 -z-10" />

            {/* Container du poster avec effet 3D */}
            <motion.div
              whileHover={{ scale: 1.02, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative"
            >
              {/* Le poster */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-cream/50">
                <Image
                  src="/images/poster-2026.png"
                  alt="Cann'Agri Expo 2026 - Affiche officielle"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Badge "Nouvelle édition" */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: -12 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="absolute -top-4 -right-4 md:-top-6 md:-right-6"
              >
                <div className="bg-terracotta text-cream px-4 py-2 rounded-full font-heading font-bold text-sm md:text-base shadow-lg transform rotate-12">
                  Édition 2026
                </div>
              </motion.div>
            </motion.div>

            {/* Effets de fumée animés */}
            <motion.div
              animate={{ y: [-5, -20, -5], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-8 left-1/4 w-16 h-16 bg-cream/20 rounded-full blur-xl"
            />
            <motion.div
              animate={{ y: [-8, -25, -8], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -top-10 right-1/4 w-20 h-20 bg-cream/15 rounded-full blur-xl"
            />
          </motion.div>

          {/* Contenu texte - côté droit */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge événement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-forest/10 backdrop-blur-sm text-forest font-medium rounded-full text-sm mb-6 border border-forest/20">
                <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
                Le salon de référence du chanvre CBD
              </span>
            </motion.div>

            {/* Titre principal */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-forest mb-6 leading-tight"
            >
              Cann&apos;Agri
              <br />
              <span className="text-terracotta">Expo 2026</span>
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg md:text-xl text-forest/80 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Rejoignez-nous pour une journée exceptionnelle dédiée à la filière chanvre CBD.
              Exposants, conférences, networking et la prestigieuse Platinum CBD Cup.
            </motion.p>

            {/* Info événement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-cream/80 backdrop-blur-sm rounded-xl shadow-md border border-cream">
                <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-heading font-bold text-forest">{siteConfig.event.date}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-cream/80 backdrop-blur-sm rounded-xl shadow-md border border-cream">
                <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-heading font-bold text-forest">{siteConfig.event.location}, {siteConfig.event.city}</span>
              </div>
            </motion.div>

            {/* Tags style bois */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap justify-center lg:justify-start gap-2 mb-10"
            >
              {tags.map((tag, index) => (
                <motion.span
                  key={tag.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 0 }}
                  className="badge-wood text-xs md:text-sm"
                  style={{ transform: `rotate(${tag.rotation}deg)` }}
                >
                  {tag.label}
                </motion.span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/billetterie">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-terracotta hover:bg-terracotta-600 text-white shadow-lg shadow-terracotta/30 hover:shadow-terracotta/50 transition-all"
                  >
                    Réserver mon Pass Pro
                  </Button>
                </motion.div>
              </Link>
              <Link href="/pro">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-forest text-forest hover:bg-forest hover:text-cream"
                  >
                    Devenir Exposant
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
          <span className="text-forest/50 text-xs uppercase tracking-widest">Découvrir</span>
          <svg className="w-5 h-5 text-forest/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Bottom Wave Transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#F4F1E8"
          />
        </svg>
      </div>
    </section>
  )
}

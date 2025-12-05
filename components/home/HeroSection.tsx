'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Button } from '@/components/ui'
import { Spotlight, FloatingParticles } from '@/components/ui/aceternity'
import { siteConfig } from '@/config/site'

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center overflow-hidden bg-gradient-to-br from-forest via-forest to-forest-600">
      {/* Spotlight Effects */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#A4B494"
      />
      <Spotlight
        className="top-40 right-0 md:right-60"
        fill="#4a6b50"
      />

      {/* Floating Particles */}
      <FloatingParticles
        className="z-0"
        quantity={60}
        colors={['rgba(164, 180, 148, 0.6)', 'rgba(244, 241, 232, 0.4)', 'rgba(74, 107, 80, 0.5)']}
        minSize={1}
        maxSize={4}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-transparent to-forest/50 z-[1]" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-[1] opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(164, 180, 148, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(164, 180, 148, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-square max-w-sm lg:max-w-md mx-auto">
              {/* Glow Effect Behind Logo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sage/40 to-cream/20 blur-3xl animate-pulse-glow" />

              {/* Animated Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A4B494" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#F4F1E8" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#A4B494" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="100"
                    cy="100"
                    r="95"
                    fill="none"
                    stroke="url(#ringGradient)"
                    strokeWidth="1"
                    strokeDasharray="10 5"
                  />
                </svg>
              </motion.div>

              {/* Logo Container */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-full h-full flex items-center justify-center p-4"
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-cream/10 to-sage/10 backdrop-blur-sm border border-sage/30 shadow-2xl">
                  <Image
                    src="/images/logo.png"
                    alt={`Logo ${siteConfig.name}`}
                    fill
                    className="object-contain p-8 drop-shadow-2xl"
                    priority
                  />
                </div>
              </motion.div>

              {/* Decorative Dots */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="absolute w-2 h-2 rounded-full bg-sage"
                  style={{
                    top: `${50 + 45 * Math.sin((i * Math.PI) / 4)}%`,
                    left: `${50 + 45 * Math.cos((i * Math.PI) / 4)}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-sage/20 backdrop-blur-sm text-cream font-medium rounded-full text-sm mb-6 border border-sage/30">
                <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                {siteConfig.event.year} - Nouvelle édition
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-cream mb-6 leading-tight"
            >
              Le Rendez-vous des
              <br />
              <span className="bg-gradient-to-r from-sage via-cream to-sage bg-clip-text text-transparent">
                Professionnels du Chanvre
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-cream/80 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Rejoignez-nous pour une journée exceptionnelle dédiée à la filière chanvre CBD.
              Exposants, conférences, networking et Platinum CBD Cup.
            </motion.p>

            {/* Event Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-cream/10 backdrop-blur-sm rounded-lg border border-cream/20">
                <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-cream">{siteConfig.event.date}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-cream/10 backdrop-blur-sm rounded-lg border border-cream/20">
                <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-semibold text-cream">{siteConfig.event.location}, {siteConfig.event.city}</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/billetterie">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-sage hover:bg-sage-600 text-forest shadow-lg shadow-sage/30 hover:shadow-sage/50 transition-all"
                >
                  Réserver mon Pass Pro
                </Button>
              </Link>
              <Link href="/pro">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-cream/50 text-cream hover:bg-cream/10 hover:border-cream"
                >
                  Devenir Exposant
                </Button>
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
          <span className="text-cream/50 text-xs uppercase tracking-widest">Découvrir</span>
          <svg className="w-5 h-5 text-cream/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent z-[2]" />
    </section>
  )
}

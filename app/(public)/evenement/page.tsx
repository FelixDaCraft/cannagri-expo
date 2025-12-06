'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Card, CardContent, Button } from '@/components/ui'
import { Spotlight, FloatingParticles } from '@/components/ui/aceternity'
import { siteConfig } from '@/config/site'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'Espace Exposition',
    description: 'Découvrez les stands de nos exposants : producteurs CBD, équipements de culture, produits bien-être, cosmétiques, alimentaire et plus encore.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Conférences & Tables Rondes',
    description: "Assistez aux interventions d'experts sur la réglementation, les tendances du marché, les innovations techniques et les perspectives de la filière.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'Platinum CBD Cup',
    description: "La compétition qui récompense les meilleurs produits CBD de l'année. Un jury d'experts évalue et prime les créations les plus innovantes.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Networking',
    description: 'Échangez avec les professionnels du secteur, développez votre réseau et découvrez de nouvelles opportunités de partenariats.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Innovations',
    description: "Découvrez les dernières avancées technologiques, les nouvelles variétés et les innovations qui façonnent l'avenir de la filière chanvre.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Documentation',
    description: 'Repartez avec des ressources, guides et contacts précieux pour développer votre activité dans le secteur du chanvre CBD.',
  },
]

const stats = [
  { value: '50+', label: 'Exposants' },
  { value: '1000+', label: 'Visiteurs attendus' },
  { value: '10+', label: 'Conférences' },
  { value: '1', label: 'Journée exceptionnelle' },
]

export default function PresentationPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-forest via-forest to-forest-600 overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60" fill="#A4B494" />
        <Spotlight className="top-20 right-0" fill="#4a6b50" />
        <FloatingParticles quantity={40} colors={['rgba(164, 180, 148, 0.5)', 'rgba(244, 241, 232, 0.3)']} />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sage/20 backdrop-blur-sm text-cream font-medium rounded-full text-sm mb-6 border border-sage/30"
            >
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              Le salon de référence du chanvre CBD
            </motion.span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-cream mb-6">
              Présentation
            </h1>
            <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto">
              Le rendez-vous incontournable des professionnels du chanvre CBD
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
      </section>

      <div className="container-custom py-12">
        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.02, rotate: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative"
          >
            {/* Glow derrière le poster */}
            <div className="absolute inset-0 bg-mint/30 rounded-3xl blur-3xl transform scale-95" />

            {/* Ombre portée */}
            <div className="absolute inset-0 bg-forest/20 rounded-3xl transform translate-x-4 translate-y-4 -z-10" />

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

            {/* Badge édition */}
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

          <div>
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-heading font-bold text-heading mb-6"
            >
              Cann&apos;Agri Expo, c&apos;est quoi ?
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-4 text-body/80"
            >
              <p>
                <strong>Cann&apos;Agri Expo</strong> est le premier salon professionnel dédié à la filière chanvre CBD
                en région Ouest. Organisé à Nantes, cet événement rassemble producteurs, distributeurs,
                transformateurs et experts du secteur pour une journée riche en échanges et découvertes.
              </p>
              <p>
                Notre objectif est de créer un espace de rencontre privilégié entre tous les acteurs
                de la filière : agriculteurs, laboratoires, boutiques spécialisées, et porteurs de projets
                innovants dans le domaine du chanvre bien-être.
              </p>
              <p>
                L&apos;édition {siteConfig.event.year} promet d&apos;être exceptionnelle avec plus de 50 exposants,
                des conférences animées par des experts reconnus, et la prestigieuse cérémonie de la
                <strong> Platinum CBD Cup</strong>.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-forest to-forest-600 text-white rounded-2xl p-8 sm:p-12 mb-16 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }} />
          </div>
          <FloatingParticles quantity={20} colors={['rgba(164, 180, 148, 0.3)', 'rgba(244, 241, 232, 0.2)']} />

          <h2 className="relative z-10 text-2xl sm:text-3xl font-heading font-bold text-center mb-8">
            Cann&apos;Agri Expo en chiffres
          </h2>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  className="text-4xl sm:text-5xl font-bold text-sage-300 mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-heading text-center mb-8">
            Ce qui vous attend
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated" className="h-full group hover:shadow-xl transition-all duration-300">
                  <CardContent>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mb-4 text-forest group-hover:bg-sage/30 transition-colors"
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-heading font-semibold text-heading mb-2 group-hover:text-forest transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-body/70">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-white rounded-2xl p-8 sm:p-12 text-center overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-sage/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-forest/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-sage/20"
            >
              <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-heading mb-4">
              Rejoignez-nous le {siteConfig.event.date}
            </h2>
            <p className="text-body/70 max-w-2xl mx-auto mb-8">
              Ne manquez pas cette occasion unique de rencontrer les acteurs clés de la filière
              chanvre CBD et de participer à l&apos;événement de référence du secteur.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/billetterie">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg">
                    Réserver mon billet
                  </Button>
                </motion.div>
              </Link>
              <Link href="/infos-pratiques">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="lg">
                    Infos pratiques
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

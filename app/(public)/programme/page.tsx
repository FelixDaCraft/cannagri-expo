'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { Spotlight, FloatingParticles } from '@/components/ui/aceternity'
import { siteConfig } from '@/config/site'

const schedule = [
  {
    time: '09:00',
    endTime: '09:30',
    title: 'Ouverture des portes',
    type: 'BREAK' as const,
    location: 'Entrée principale',
  },
  {
    time: '09:30',
    endTime: '10:30',
    title: 'Conférence d\'ouverture : L\'état du marché CBD en France',
    type: 'CONFERENCE' as const,
    speaker: 'Expert à confirmer',
    speakerTitle: 'Analyste marché',
    location: 'Scène principale',
    description: 'Panorama complet du marché CBD français : chiffres clés, tendances et perspectives.',
  },
  {
    time: '10:45',
    endTime: '11:45',
    title: 'Table ronde : Réglementation européenne du CBD',
    type: 'CONFERENCE' as const,
    speaker: 'Panel d\'experts',
    location: 'Scène principale',
    description: 'Discussion autour des évolutions réglementaires et leur impact sur la filière.',
  },
  {
    time: '12:00',
    endTime: '14:00',
    title: 'Pause déjeuner & Networking',
    type: 'BREAK' as const,
    location: 'Espace restauration',
  },
  {
    time: '14:00',
    endTime: '15:00',
    title: 'Atelier : Techniques de culture indoor',
    type: 'WORKSHOP' as const,
    speaker: 'Expert technique',
    location: 'Salle B',
    description: 'Découvrez les dernières innovations en matière de culture indoor.',
  },
  {
    time: '15:15',
    endTime: '16:15',
    title: 'Conférence : CBD et bien-être - Études scientifiques',
    type: 'CONFERENCE' as const,
    speaker: 'Dr. À confirmer',
    speakerTitle: 'Chercheur',
    location: 'Scène principale',
  },
  {
    time: '16:30',
    endTime: '18:00',
    title: 'Platinum CBD Cup - Cérémonie de remise des prix',
    type: 'CEREMONY' as const,
    location: 'Scène principale',
    description: 'Remise des prix aux meilleures variétés CBD de l\'année.',
    isPlatinumCBDCup: true,
  },
  {
    time: '18:00',
    endTime: '19:00',
    title: 'Cocktail de clôture',
    type: 'NETWORKING' as const,
    location: 'Espace VIP',
  },
]

const typeConfig = {
  CONFERENCE: { label: 'Conférence', color: 'bg-forest text-white', icon: '🎤' },
  WORKSHOP: { label: 'Atelier', color: 'bg-sage text-forest', icon: '🛠️' },
  CEREMONY: { label: 'Cérémonie', color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white', icon: '🏆' },
  BREAK: { label: 'Pause', color: 'bg-gray-100 text-gray-600', icon: '☕' },
  NETWORKING: { label: 'Networking', color: 'bg-blue-100 text-blue-700', icon: '🤝' },
}

const filterTypes = ['Tous', 'Conférence', 'Atelier', 'Cérémonie']

export default function ProgrammePage() {
  const [filter, setFilter] = useState('Tous')

  const filteredSchedule = filter === 'Tous'
    ? schedule
    : schedule.filter(e => typeConfig[e.type].label === filter)

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-forest via-forest to-forest-600 overflow-hidden">
        <Spotlight className="-top-40 right-0 md:right-60" fill="#A4B494" />
        <FloatingParticles quantity={30} colors={['rgba(164, 180, 148, 0.5)', 'rgba(244, 241, 232, 0.3)']} />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-cream mb-6">
              Programme
            </h1>
            <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto mb-6">
              Une journée riche en conférences, ateliers et networking
            </p>
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-cream/10 backdrop-blur-sm rounded-full border border-cream/20">
              <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-cream">{siteConfig.event.date}</span>
              <span className="text-cream/60">•</span>
              <span className="text-cream/80">{siteConfig.event.location}</span>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
      </section>

      <div className="container-custom py-12">
        {/* Platinum CBD Cup Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-white rounded-2xl p-6 md:p-8 mb-12 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              🏆
            </motion.div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">
                Platinum CBD Cup
              </h2>
              <p className="text-white/90">
                Le concours de référence qui récompense les meilleures variétés CBD de l&apos;année.
                Participez à la dégustation et votez pour vos favoris !
              </p>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-sm px-4 py-2">
              16h30 - Scène principale
            </Badge>
          </div>
        </motion.div>

        {/* Filter - Mobile Scroll */}
        <div className="mb-8 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            {filterTypes.map((type) => (
              <motion.button
                key={type}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(type)}
                className={`px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  filter === type
                    ? 'bg-forest text-white shadow-lg'
                    : 'bg-white text-body hover:bg-sage/20 border border-sage/20'
                }`}
              >
                {type}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredSchedule.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                variant="elevated"
                className={`overflow-hidden transition-all ${
                  event.isPlatinumCBDCup
                    ? 'ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/20'
                    : 'hover:shadow-lg'
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Time Column */}
                    <div className="flex-shrink-0 w-20 md:w-24 py-4 px-3 bg-sage/5 flex flex-col items-center justify-center border-r border-sage/10">
                      <div className="text-lg md:text-xl font-heading font-bold text-forest">
                        {event.time}
                      </div>
                      <div className="text-xs text-body/50">
                        {event.endTime}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig[event.type].color}`}>
                          <span>{typeConfig[event.type].icon}</span>
                          {typeConfig[event.type].label}
                        </span>
                        {event.isPlatinumCBDCup && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                            Événement phare
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-heading font-semibold text-heading text-lg mb-1">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="text-sm text-body/70 mb-3">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-body/60">
                        {event.speaker && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {event.speaker}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-body/70 mb-4">
            Le programme définitif sera annoncé prochainement.
          </p>
          <Button variant="outline" className="opacity-50" disabled>
            Programme complet (PDF) - Bientôt
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

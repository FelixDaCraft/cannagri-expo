'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, Badge } from '@/components/ui'
import { Spotlight, FloatingParticles } from '@/components/ui/aceternity'
import { siteConfig } from '@/config/site'
import { getTranslatedText, Translations } from '@/lib/translation'

interface Speaker {
  id: string
  name: string
  title: string
  company: string
  photo: string
  bio: string
}

interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  type: string
  startAt: Date | string
  endAt: Date | string
  location: string | null
  speakers: Speaker[]
  // Legacy fields
  speakerName: string | null
  speakerTitle: string | null
  isPlatinumCBDCup: boolean
  isHighlighted: boolean
  displayOrder: number
  // Traductions
  titleTranslations: Translations | null
  descriptionTranslations: Translations | null
}

const typeConfig = {
  CONFERENCE: { label: 'Conférence', color: 'bg-forest text-white', icon: '🎤' },
  WORKSHOP: { label: 'Atelier', color: 'bg-sage text-forest', icon: '🛠️' },
  CEREMONY: { label: 'Cérémonie', color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white', icon: '🏆' },
  BREAK: { label: 'Pause', color: 'bg-gray-100 text-gray-600', icon: '☕' },
  NETWORKING: { label: 'Networking', color: 'bg-blue-100 text-blue-700', icon: '🤝' },
}

const filterTypes = ['Tous', 'Conférence', 'Atelier', 'Cérémonie']

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface ProgrammeClientProps {
  events: Event[]
  locale: string
}

export default function ProgrammeClient({ events, locale }: ProgrammeClientProps) {
  const [filter, setFilter] = useState('Tous')

  const filteredEvents = filter === 'Tous'
    ? events
    : events.filter(e => typeConfig[e.type as keyof typeof typeConfig]?.label === filter)

  // Check if there's a Platinum CBD Cup event
  const hasPlatinumCBDCup = events.some(e => e.isPlatinumCBDCup)
  const platinumEvent = events.find(e => e.isPlatinumCBDCup)

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
        {hasPlatinumCBDCup && platinumEvent && (
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
                  {platinumEvent.description
                    ? getTranslatedText(platinumEvent.description, platinumEvent.descriptionTranslations, locale)
                    : "Le concours de référence qui récompense les meilleures variétés CBD de l'année. Participez à la dégustation et votez pour vos favoris !"}
                </p>
              </div>
              <Badge className="bg-white/20 text-white border-0 text-sm px-4 py-2">
                {formatTime(platinumEvent.startAt)} - {platinumEvent.location}
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-heading font-bold text-heading mb-2">
              Programme à venir
            </h2>
            <p className="text-body/70 max-w-md mx-auto">
              Le programme détaillé de l&apos;événement sera bientôt disponible.
              Revenez nous voir prochainement !
            </p>
          </div>
        ) : (
          <>
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
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
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
                            {formatTime(event.startAt)}
                          </div>
                          <div className="text-xs text-body/50">
                            {formatTime(event.endAt)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig[event.type as keyof typeof typeConfig]?.color || 'bg-gray-100 text-gray-600'}`}>
                              <span>{typeConfig[event.type as keyof typeof typeConfig]?.icon || '📅'}</span>
                              {typeConfig[event.type as keyof typeof typeConfig]?.label || event.type}
                            </span>
                            {event.isPlatinumCBDCup && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                                Événement phare
                              </Badge>
                            )}
                            {event.isHighlighted && !event.isPlatinumCBDCup && (
                              <Badge variant="terracotta">
                                À ne pas manquer
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-heading font-semibold text-heading text-lg mb-1">
                            {getTranslatedText(event.title, event.titleTranslations, locale)}
                          </h3>

                          {event.description && (
                            <p className="text-sm text-body/70 mb-3">
                              {getTranslatedText(event.description, event.descriptionTranslations, locale)}
                            </p>
                          )}

                          {/* Speakers */}
                          {event.speakers && event.speakers.length > 0 && (
                            <div className="flex flex-wrap gap-3 mb-3">
                              {event.speakers.map((speaker, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  {speaker.photo ? (
                                    <img
                                      src={speaker.photo}
                                      alt={speaker.name}
                                      className="w-8 h-8 rounded-full object-cover border border-sage/30"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none'
                                      }}
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center text-forest text-xs font-bold">
                                      {speaker.name.charAt(0)}
                                    </div>
                                  )}
                                  <div className="text-xs">
                                    <div className="font-medium text-body">{speaker.name}</div>
                                    {speaker.title && (
                                      <div className="text-body/60">{speaker.title}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3 text-xs text-body/60">
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          {events.length === 0 ? (
            <p className="text-body/70">
              Inscrivez-vous à notre newsletter pour être informé de la publication du programme.
            </p>
          ) : (
            <p className="text-body/70">
              Le programme peut être sujet à modifications.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

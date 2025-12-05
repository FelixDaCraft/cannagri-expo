import Image from 'next/image'
import Link from 'next/link'
import { Button, Badge } from '@/components/ui'
import type { Event } from '@/types'

interface ProgramHighlightProps {
  event?: Event | null
}

export function ProgramHighlight({ event }: ProgramHighlightProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title">Temps Forts & Conférences</h2>
          <p className="section-subtitle">
            Un programme riche avec des intervenants de qualité pour comprendre
            les enjeux de la filière chanvre CBD.
          </p>
        </div>

        {/* Featured Event */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            {/* Speaker Photo */}
            <div className="md:col-span-2">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-sage/20">
                {event?.speakerPhoto ? (
                  <Image
                    src={event.speakerPhoto}
                    alt={event.speakerName || 'Intervenant'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Event Info */}
            <div className="md:col-span-3">
              <Badge variant="forest" className="mb-4">
                {event?.type === 'CONFERENCE' ? 'Conférence' :
                 event?.type === 'WORKSHOP' ? 'Atelier' :
                 event?.type === 'CEREMONY' ? 'Cérémonie' :
                 'Conférence d\'ouverture'}
              </Badge>

              <h3 className="text-2xl md:text-3xl font-heading font-bold text-heading mb-4">
                {event?.title || "L'Avenir de la réglementation européenne du CBD"}
              </h3>

              <p className="text-body/70 mb-4 leading-relaxed">
                {event?.description ||
                  "Quelles perspectives pour la filière chanvre CBD en France et en Europe ? Les dernières évolutions réglementaires et leurs impacts sur les acteurs du marché."}
              </p>

              {(event?.speakerName || !event) && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-heading">
                      {event?.speakerName || "Expert à confirmer"}
                    </p>
                    <p className="text-sm text-body/60">
                      {event?.speakerTitle || event?.speakerCompany || "Intervenant spécialiste"}
                    </p>
                  </div>
                </div>
              )}

              <Link href="/programme">
                <Button>
                  Voir tout le programme
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { number: '10+', label: 'Conférences' },
            { number: '20+', label: 'Intervenants' },
            { number: '50+', label: 'Exposants' },
            { number: '1', label: 'Platinum CBD Cup' },
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-cream">
              <div className="text-3xl md:text-4xl font-heading font-bold text-forest mb-1">
                {stat.number}
              </div>
              <div className="text-body/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

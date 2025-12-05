import { Metadata } from 'next'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Programme',
  description: 'Découvrez le programme complet du salon Cann\'Agri Expo - Conférences, ateliers et Platinum CBD Cup',
}

// Mock schedule data
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
  CONFERENCE: { label: 'Conférence', color: 'forest' as const },
  WORKSHOP: { label: 'Atelier', color: 'sage' as const },
  CEREMONY: { label: 'Cérémonie', color: 'forest' as const },
  BREAK: { label: 'Pause', color: 'default' as const },
  NETWORKING: { label: 'Networking', color: 'info' as const },
}

export default function ProgrammePage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-heading mb-4">
            Programme
          </h1>
          <p className="text-lg text-body/70 max-w-2xl mx-auto">
            Une journée riche en conférences, ateliers et networking
            <br />
            <strong>{siteConfig.event.date}</strong> - {siteConfig.event.location}, {siteConfig.event.city}
          </p>
        </div>

        {/* Platinum CBD Cup Banner */}
        <div className="bg-forest text-white rounded-2xl p-8 mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-8 h-8 text-sage" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <h2 className="text-2xl md:text-3xl font-heading font-bold">
              Platinum CBD Cup
            </h2>
            <svg className="w-8 h-8 text-sage" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <p className="text-white/80 max-w-2xl mx-auto mb-6">
            Le concours de référence qui récompense les meilleures variétés CBD de l&apos;année.
            Participez à la dégustation et votez pour vos favoris !
          </p>
          <Badge variant="sage" size="md">16h30 - Scène principale</Badge>
        </div>

        {/* Schedule */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-heading font-bold text-heading mb-6">
            Déroulé de la journée
          </h2>

          <div className="space-y-4">
            {schedule.map((event, index) => (
              <Card
                key={index}
                variant={event.isPlatinumCBDCup ? 'bordered' : 'default'}
                className={event.isPlatinumCBDCup ? 'ring-2 ring-forest' : ''}
              >
                <CardContent className="flex gap-4">
                  {/* Time */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="text-lg font-heading font-bold text-forest">
                      {event.time}
                    </div>
                    <div className="text-xs text-body/50">
                      {event.endTime}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={typeConfig[event.type].color} size="sm">
                        {typeConfig[event.type].label}
                      </Badge>
                      {event.isPlatinumCBDCup && (
                        <Badge variant="forest" size="sm">
                          Platinum CBD Cup
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-heading font-semibold text-heading mb-1">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-sm text-body/70 mb-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-body/60">
                      {event.speaker && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {event.speaker}
                          {event.speakerTitle && ` - ${event.speakerTitle}`}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-body/70 mb-4">
            Le programme définitif sera annoncé prochainement.
          </p>
          <Button variant="outline" disabled>
            Programme complet (PDF) - Bientôt disponible
          </Button>
        </div>
      </div>
    </div>
  )
}

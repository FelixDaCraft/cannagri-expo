import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Speaker format stored in Event.speakers JSON array
interface SpeakerJson {
  name?: string
  title?: string
  company?: string
  photo?: string
  bio?: string
}

interface Translations {
  en?: string
  de?: string
  es?: string
  it?: string
}

// GET /api/programme - Get all conferences for public display (used by InstaPlanner)
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        type: 'CONFERENCE',
      },
      select: {
        id: true,
        title: true,
        titleTranslations: true,
        description: true,
        descriptionTranslations: true,
        startAt: true,
        endAt: true,
        location: true,
        speakers: true,
        // Legacy single-speaker fields (fallback)
        speakerName: true,
        speakerTitle: true,
        speakerPhoto: true,
        isHighlighted: true,
        displayOrder: true,
      },
      orderBy: [
        { startAt: 'asc' },
        { displayOrder: 'asc' },
      ],
    })

    const conferences = events.map((event) => {
      // Normalize speakers: prefer JSON array, fall back to legacy fields
      let speakers: Array<{ name: string; role: string; photo: string | null }> = []

      const speakersJson = event.speakers as SpeakerJson[] | null
      if (Array.isArray(speakersJson) && speakersJson.length > 0) {
        speakers = speakersJson.map((s) => ({
          name: s.name || '',
          role: [s.title, s.company].filter(Boolean).join(' · '),
          photo: s.photo || null,
        }))
      } else if (event.speakerName) {
        // Legacy fallback
        speakers = [{
          name: event.speakerName,
          role: event.speakerTitle || '',
          photo: event.speakerPhoto || null,
        }]
      }

      return {
        id: event.id,
        title: event.title,
        titleTranslations: event.titleTranslations as Translations | null,
        description: event.description,
        descriptionTranslations: event.descriptionTranslations as Translations | null,
        startAt: event.startAt.toISOString(),
        endAt: event.endAt.toISOString(),
        // Formatted time string for display: "10:00 - 11:30"
        timeLabel: `${formatTime(event.startAt)} - ${formatTime(event.endAt)}`,
        location: event.location,
        speakers,
        isHighlighted: event.isHighlighted,
      }
    })

    return NextResponse.json({
      success: true,
      data: conferences,
    })
  } catch (error) {
    console.error('Error fetching programme:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du programme' },
      { status: 500 }
    )
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  })
}

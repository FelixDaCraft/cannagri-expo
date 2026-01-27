import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { translateToAllLanguages } from '@/lib/translation'

// POST - Traduire automatiquement le contenu d'un événement
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN ou ADMIN
    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = params

    // Récupérer l'événement
    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    // Traduire les champs
    const translations: {
      titleTranslations?: object
      descriptionTranslations?: object
    } = {}

    // Traduire le titre
    if (event.title) {
      translations.titleTranslations = await translateToAllLanguages(event.title)
    }

    // Traduire la description
    if (event.description) {
      translations.descriptionTranslations = await translateToAllLanguages(event.description)
    }

    // Mettre à jour l'événement avec les traductions
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: translations
    })

    return NextResponse.json({
      success: true,
      message: 'Traductions générées avec succès',
      translations: {
        titleTranslations: updatedEvent.titleTranslations,
        descriptionTranslations: updatedEvent.descriptionTranslations
      }
    })
  } catch (error) {
    console.error('Erreur lors de la traduction:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la traduction' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour manuellement une traduction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN ou ADMIN
    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { field, locale, value } = body

    if (!field || !locale || value === undefined) {
      return NextResponse.json(
        { error: 'Champs requis: field, locale, value' },
        { status: 400 }
      )
    }

    // Vérifier que le champ est valide
    const validFields = [
      'titleTranslations',
      'descriptionTranslations'
    ]

    if (!validFields.includes(field)) {
      return NextResponse.json(
        { error: 'Champ de traduction invalide' },
        { status: 400 }
      )
    }

    // Vérifier que la locale est valide
    const validLocales = ['en', 'de', 'es', 'it']
    if (!validLocales.includes(locale)) {
      return NextResponse.json(
        { error: 'Locale invalide' },
        { status: 400 }
      )
    }

    // Récupérer l'événement actuel
    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    // Mettre à jour la traduction spécifique
    const currentTranslations = (event[field as keyof typeof event] as object) || {}
    const updatedTranslations = {
      ...currentTranslations,
      [locale]: value
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        [field]: updatedTranslations
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Traduction mise à jour',
      translations: updatedEvent[field as keyof typeof updatedEvent]
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la traduction:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

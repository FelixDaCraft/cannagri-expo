import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { translateToAllLanguages } from '@/lib/translation'

// POST - Traduire automatiquement le contenu d'un sponsor
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

    // Récupérer le sponsor
    const sponsor = await prisma.sponsor.findUnique({
      where: { id }
    })

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor non trouvé' }, { status: 404 })
    }

    // Traduire les champs
    const translations: {
      articleTitleTranslations?: object
      articleBodyTranslations?: object
      descriptionTranslations?: object
      exhibitorDescriptionTranslations?: object
    } = {}

    // Traduire le titre de l'article
    if (sponsor.articleTitle) {
      translations.articleTitleTranslations = await translateToAllLanguages(sponsor.articleTitle)
    }

    // Traduire le corps de l'article
    if (sponsor.articleBody) {
      translations.articleBodyTranslations = await translateToAllLanguages(sponsor.articleBody)
    }

    // Traduire la description
    if (sponsor.description) {
      translations.descriptionTranslations = await translateToAllLanguages(sponsor.description)
    }

    // Traduire la description exposant
    if (sponsor.exhibitorDescription) {
      translations.exhibitorDescriptionTranslations = await translateToAllLanguages(sponsor.exhibitorDescription)
    }

    // Mettre à jour le sponsor avec les traductions
    const updatedSponsor = await prisma.sponsor.update({
      where: { id },
      data: translations
    })

    return NextResponse.json({
      success: true,
      message: 'Traductions générées avec succès',
      translations: {
        articleTitleTranslations: updatedSponsor.articleTitleTranslations,
        articleBodyTranslations: updatedSponsor.articleBodyTranslations,
        descriptionTranslations: updatedSponsor.descriptionTranslations,
        exhibitorDescriptionTranslations: updatedSponsor.exhibitorDescriptionTranslations
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
      'articleTitleTranslations',
      'articleBodyTranslations',
      'descriptionTranslations',
      'exhibitorDescriptionTranslations'
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

    // Récupérer le sponsor actuel
    const sponsor = await prisma.sponsor.findUnique({
      where: { id }
    })

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor non trouvé' }, { status: 404 })
    }

    // Mettre à jour la traduction spécifique
    const currentTranslations = (sponsor[field as keyof typeof sponsor] as object) || {}
    const updatedTranslations = {
      ...currentTranslations,
      [locale]: value
    }

    const updatedSponsor = await prisma.sponsor.update({
      where: { id },
      data: {
        [field]: updatedTranslations
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Traduction mise à jour',
      translations: updatedSponsor[field as keyof typeof updatedSponsor]
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la traduction:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { translateToAllLanguages } from '@/lib/translation'

// POST - Traduire automatiquement la description d'un compte PRO (exposant)
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

    // Récupérer le compte PRO
    const pro = await prisma.user.findUnique({
      where: { id }
    })

    if (!pro) {
      return NextResponse.json({ error: 'Compte PRO non trouvé' }, { status: 404 })
    }

    // Vérifier que c'est bien un compte PRO
    if (pro.role !== 'PRO') {
      return NextResponse.json({ error: 'Ce compte n\'est pas un compte PRO' }, { status: 400 })
    }

    // Traduire la description de l'entreprise
    const translations: {
      companyDescriptionTranslations?: object
    } = {}

    if (pro.companyDescription) {
      translations.companyDescriptionTranslations = await translateToAllLanguages(pro.companyDescription)
    }

    // Mettre à jour le compte PRO avec les traductions
    const updatedPro = await prisma.user.update({
      where: { id },
      data: translations,
      select: {
        id: true,
        companyName: true,
        companyDescription: true,
        companyDescriptionTranslations: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Traductions générées avec succès',
      translations: {
        companyDescriptionTranslations: updatedPro.companyDescriptionTranslations
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
    const validFields = ['companyDescriptionTranslations']

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

    // Récupérer le compte PRO actuel
    const pro = await prisma.user.findUnique({
      where: { id }
    })

    if (!pro) {
      return NextResponse.json({ error: 'Compte PRO non trouvé' }, { status: 404 })
    }

    // Mettre à jour la traduction spécifique
    const currentTranslations = (pro[field as keyof typeof pro] as object) || {}
    const updatedTranslations = {
      ...currentTranslations,
      [locale]: value
    }

    const updatedPro = await prisma.user.update({
      where: { id },
      data: {
        [field]: updatedTranslations
      },
      select: {
        id: true,
        companyDescriptionTranslations: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Traduction mise à jour',
      translations: updatedPro[field as keyof typeof updatedPro]
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la traduction:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

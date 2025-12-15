import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/admin/sponsors - Get all sponsors (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const sponsors = await prisma.sponsor.findMany({
      include: {
        stand: true, // Inclure les infos du stand associé
      },
      orderBy: [
        { type: 'asc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json({ success: true, data: sponsors })
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sponsors' },
      { status: 500 }
    )
  }
}

// POST /api/admin/sponsors - Create a new sponsor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      type,
      logoUrl,
      description,
      websiteUrl,
      articleTitle,
      articleBody,
      articleImage,
      displayOrder,
      isActive,
      // Nouveaux champs exposant
      standId,
      exhibitorDescription,
      exhibitorCategory,
      contactName,
      contactEmail,
      contactPhone,
    } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Le nom et le slug sont requis' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingSponsor = await prisma.sponsor.findUnique({
      where: { slug },
    })

    if (existingSponsor) {
      return NextResponse.json(
        { error: 'Ce slug existe déjà' },
        { status: 400 }
      )
    }

    // Si un stand est sélectionné, vérifier qu'il est disponible
    if (standId) {
      const stand = await prisma.stand.findUnique({
        where: { id: standId },
      })
      if (!stand) {
        return NextResponse.json(
          { error: 'Stand non trouvé' },
          { status: 400 }
        )
      }
      // Vérifier que le stand n'est pas déjà attribué à un autre sponsor
      const standAlreadyAssigned = await prisma.sponsor.findFirst({
        where: { standId },
      })
      if (standAlreadyAssigned) {
        return NextResponse.json(
          { error: 'Ce stand est déjà attribué à un autre sponsor' },
          { status: 400 }
        )
      }
    }

    // Créer le sponsor avec transaction pour mettre à jour le stand
    const sponsor = await prisma.$transaction(async (tx) => {
      // Créer le sponsor
      const newSponsor = await tx.sponsor.create({
        data: {
          name,
          slug,
          type: type || 'BRONZE',
          logoUrl: logoUrl || null,
          description: description || null,
          websiteUrl: websiteUrl || null,
          articleTitle: articleTitle || null,
          articleBody: articleBody || null,
          articleImage: articleImage || null,
          displayOrder: displayOrder || 0,
          isActive: isActive ?? true,
          // Champs exposant
          standId: standId || null,
          exhibitorDescription: exhibitorDescription || null,
          exhibitorCategory: exhibitorCategory || null,
          contactName: contactName || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
        },
        include: {
          stand: true,
        },
      })

      // Si un stand est attribué, le marquer comme SOLD
      if (standId) {
        await tx.stand.update({
          where: { id: standId },
          data: {
            status: 'SOLD',
            exhibitorName: name,
          },
        })
      }

      return newSponsor
    })

    return NextResponse.json({ success: true, data: sponsor }, { status: 201 })
  } catch (error) {
    console.error('Error creating sponsor:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du sponsor' },
      { status: 500 }
    )
  }
}

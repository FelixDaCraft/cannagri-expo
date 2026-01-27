import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// POST /api/account/request-pro - Request PRO account upgrade
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Check current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isApproved: true },
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Already PRO
    if (currentUser.role === 'PRO') {
      return NextResponse.json(
        { error: 'Vous avez déjà un compte professionnel' },
        { status: 400 }
      )
    }

    // Admin cannot request PRO (they already have all access)
    if (currentUser.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Les administrateurs ont déjà accès à toutes les fonctionnalités' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { companyName, siret, businessType } = body

    // Validation
    if (!companyName) {
      return NextResponse.json(
        { error: 'Le nom de l\'entreprise est requis' },
        { status: 400 }
      )
    }

    if (!siret) {
      return NextResponse.json(
        { error: 'Le SIRET est requis' },
        { status: 400 }
      )
    }

    if (!businessType) {
      return NextResponse.json(
        { error: 'Le type d\'activité est requis' },
        { status: 400 }
      )
    }

    // Validate businessType
    const validTypes = ['PRODUCTEURS', 'MATERIEL', 'LIFESTYLE', 'SERVICE']
    if (!validTypes.includes(businessType)) {
      return NextResponse.json(
        { error: 'Type d\'activité invalide' },
        { status: 400 }
      )
    }

    // Update user to PRO with isApproved = false
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: 'PRO',
        companyName,
        siret,
        businessType,
        isApproved: false, // Needs admin approval
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        companyName: true,
        siret: true,
        businessType: true,
        role: true,
        isApproved: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Votre demande de compte professionnel a été envoyée',
      data: user,
    })
  } catch (error) {
    console.error('Error requesting PRO:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la demande' },
      { status: 500 }
    )
  }
}

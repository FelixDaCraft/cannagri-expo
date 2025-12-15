import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/account/profile - Get current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        companyName: true,
        companyDescription: true,
        companyLogo: true,
        companyWebsite: true,
        siret: true,
        businessType: true,
        role: true,
        isApproved: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    )
  }
}

// PATCH /api/account/profile - Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, companyName, companyDescription, companyLogo, companyWebsite, businessType } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
        phone: phone || null,
        companyName: companyName || null,
        ...(companyDescription !== undefined ? { companyDescription: companyDescription || null } : {}),
        ...(companyLogo !== undefined ? { companyLogo: companyLogo || null } : {}),
        ...(companyWebsite !== undefined ? { companyWebsite: companyWebsite || null } : {}),
        ...(businessType !== undefined ? { businessType: businessType || null } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        companyName: true,
        companyDescription: true,
        companyLogo: true,
        companyWebsite: true,
        siret: true,
        businessType: true,
        role: true,
        isApproved: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}

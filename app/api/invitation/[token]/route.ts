import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/invitation/[token] - Get invitation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation non trouvée' },
        { status: 404 }
      )
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cette invitation n\'est plus valide', status: invitation.status },
        { status: 400 }
      )
    }

    if (new Date() > invitation.expiresAt) {
      // Mark as expired
      await prisma.teamInvitation.update({
        where: { token },
        data: { status: 'EXPIRED' },
      })

      return NextResponse.json(
        { error: 'Cette invitation a expiré' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
      },
    })
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    )
  }
}

// POST /api/invitation/[token] - Accept invitation and create account
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { name, password } = body

    // Validation
    if (!name || !password) {
      return NextResponse.json(
        { error: 'Nom et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation non trouvée' },
        { status: 404 }
      )
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cette invitation n\'est plus valide' },
        { status: 400 }
      )
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.teamInvitation.update({
        where: { token },
        data: { status: 'EXPIRED' },
      })

      return NextResponse.json(
        { error: 'Cette invitation a expiré' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet email' },
        { status: 400 }
      )
    }

    // Create user and mark invitation as accepted
    const hashedPassword = await bcrypt.hash(password, 12)

    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          email: invitation.email,
          name,
          hashedPassword,
          role: invitation.role,
          emailVerified: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      }),
      prisma.teamInvitation.update({
        where: { token },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}

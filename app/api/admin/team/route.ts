import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkSuperAdminAuth, checkFullAdminAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth'
import { sendTeamInvitation } from '@/lib/email'

// GET /api/admin/team - List all team members and pending invitations
export async function GET() {
  try {
    // Only full admins can view team (SUPER_ADMIN, ADMIN)
    const session = await checkFullAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    // Get all admin users (not PRO)
    const members = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN', 'CONTRIBUTOR'],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        role: true,
        createdAt: true,
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
    })

    // Get pending invitations (only SUPER_ADMIN can see)
    let invitations: Array<{
      id: string
      email: string
      role: string
      status: string
      expiresAt: Date
      createdAt: Date
      invitedBy: { email: string; name: string | null }
    }> = []

    if (session.user.role === 'SUPER_ADMIN') {
      invitations = await prisma.teamInvitation.findMany({
        where: {
          status: 'PENDING',
        },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          invitedBy: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    }

    return NextResponse.json({
      members,
      invitations,
      canManageRoles: session.user.role === 'SUPER_ADMIN',
    })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}

// POST /api/admin/team - Invite a new team member
export async function POST(request: NextRequest) {
  try {
    // Only SUPER_ADMIN can invite
    const session = await checkSuperAdminAuth()
    if (!session) {
      return forbiddenResponse('Seul le Super Admin peut inviter des collaborateurs')
    }

    const body = await request.json()
    const { email, role } = body

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Validate role
    const allowedRoles = ['ADMIN', 'CONTRIBUTOR']
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Check if invitation already pending
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        email,
        status: 'PENDING',
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Une invitation est déjà en attente pour cet email' },
        { status: 400 }
      )
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await prisma.teamInvitation.create({
      data: {
        email,
        role,
        expiresAt,
        invitedById: session.user.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        token: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invitation/${invitation.token}`

    // Send invitation email
    let emailSent = false
    try {
      await sendTeamInvitation({
        to: email,
        inviterName: session.user.name || session.user.email || 'L\'administrateur',
        role: invitation.role,
        inviteUrl,
        expiresAt: invitation.expiresAt,
      })
      emailSent = true
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Continue even if email fails - invitation is still created
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
      emailSent,
      // Show invite URL if email failed (for manual sharing)
      ...(emailSent ? {} : { inviteUrl }),
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

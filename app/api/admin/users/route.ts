import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Liste des utilisateurs (USER et PRO)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Seuls SUPER_ADMIN et ADMIN peuvent voir les utilisateurs
    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // 'USER', 'PRO', ou null pour tous
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Construire le filtre
    const where: Record<string, unknown> = {
      role: role ? role : { in: ['USER', 'PRO'] },
    }

    // Recherche par email ou nom
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          image: true,
          role: true,
          isApproved: true,
          companyName: true,
          phone: true,
          businessType: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          accounts: {
            select: {
              provider: true,
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    // Formater les données
    const formattedUsers = users.map(user => ({
      ...user,
      authProvider: user.accounts.length > 0
        ? user.accounts.map(a => a.provider).join(', ')
        : 'email',
      accounts: undefined,
    }))

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      canManageUsers: session.user.role === 'SUPER_ADMIN',
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

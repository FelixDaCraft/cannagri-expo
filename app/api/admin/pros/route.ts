import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/admin/pros - List all Pro accounts
export async function GET() {
  try {
    const pros = await prisma.user.findMany({
      where: {
        role: 'PRO',
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        companyName: true,
        phone: true,
        siret: true,
        businessType: true,
        isApproved: true,
        createdAt: true,
        _count: {
          select: {
            stands: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ data: pros })
  } catch (error) {
    console.error('Error fetching pros:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pro accounts' },
      { status: 500 }
    )
  }
}

// POST /api/admin/pros - Create a new Pro account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, firstName, companyName, phone, siret, businessType } = body

    // Validation
    if (!email || !companyName) {
      return NextResponse.json(
        { error: 'Email et nom d\'entreprise requis' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Generate a random password (user will need to reset it)
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    const pro = await prisma.user.create({
      data: {
        email,
        name: name || null,
        firstName: firstName || null,
        companyName,
        phone: phone || null,
        siret: siret || null,
        businessType: businessType || null,
        hashedPassword,
        role: 'PRO',
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        companyName: true,
        phone: true,
        siret: true,
        businessType: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: pro,
      // In production, you would send this password by email instead of returning it
      tempPassword,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating pro:', error)
    return NextResponse.json(
      { error: 'Failed to create pro account' },
      { status: 500 }
    )
  }
}

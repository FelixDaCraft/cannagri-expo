import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { checkRateLimit, getClientIP, RATE_LIMIT_PRESETS } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`reset-password:${clientIP}`, RATE_LIMIT_PRESETS.SENSITIVE)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }

    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Lien invalide ou expiré. Veuillez refaire une demande.' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    console.log(`Password reset successful for: ${user.email}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in reset-password:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
